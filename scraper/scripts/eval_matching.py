"""Evaluate product matching on current database or test corpus."""

import sys
from collections import defaultdict
from solotono.db.session import get_db_session
from solotono.db.models import Entity, Product, Store
from solotono.matching.matcher import ProductMatcher


def evaluate_matcher():
    with get_db_session() as session:
        entities = session.query(Entity).order_by(Entity.id).all()
        stores = {s.id: s.name for s in session.query(Store).all()}
        print(f"Loaded {len(entities)} entities across {len(stores)} stores.")

        matcher = ProductMatcher(session)

        # Simulate fresh clustering from scratch
        clusters = {}
        next_id = 1
        intra_store_blocks = 0

        for e in entities:
            best_cid = None
            best_score = 0.0

            # Find matching cluster
            for cid, cluster in clusters.items():
                # Check store exclusivity
                if e.store_id in cluster["store_ids"]:
                    intra_store_blocks += 1
                    continue

                res = matcher._evaluate_candidate(e, cluster)
                if res and res["score"] >= matcher.similarity_threshold:
                    if res["score"] > best_score:
                        best_score = res["score"]
                        best_cid = cid

            if best_cid is not None:
                clusters[best_cid]["entities"].append(e)
                clusters[best_cid]["store_ids"].add(e.store_id)
            else:
                clusters[next_id] = {
                    "id": next_id,
                    "brand": e.brand,
                    "name": e.name,
                    "part_number": e.part_number,
                    "ean": e.ean,
                    "store_ids": {e.store_id},
                    "entities": [e]
                }
                next_id += 1

        multi_store_clusters = [c for c in clusters.values() if len(c["entities"]) > 1]
        print(f"\nSimulated Clusters Summary:")
        print(f"Total Unique Canonical Products Created: {len(clusters)}")
        print(f"Multi-Store Clustered Products: {len(multi_store_clusters)}")
        print(f"Same-Store Duplicates Prevented: {intra_store_blocks}")

        print("\n" + "="*80)
        print("ALL CROSS-STORE MATCHES FORMED BY THE NEW MATCHER:")
        print("="*80)
        for c in multi_store_clusters:
            print(f"\nCluster #{c['id']}: {c['name']}")
            for ent in c["entities"]:
                st_name = stores.get(ent.store_id, f"Store {ent.store_id}")
                print(f"   [{st_name:15}] (SKU: {ent.sku or '-'}) {ent.name}")


if __name__ == "__main__":
    evaluate_matcher()
