// Copia solo los campos permitidos del body. Evita "mass assignment" (que el cliente
// fije campos como `user` o `passwordHash`) y descarta cualquier cosa que no sea objeto.
export const pick = (body: unknown, allowed: string[]): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    if (typeof body !== "object" || body === null || Array.isArray(body)) return result;
    const source = body as Record<string, unknown>;
    for (const key of allowed) {
      if (key in source && source[key] !== undefined) result[key] = source[key];
    }
    return result;
  };
  
  export const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  