// Extiende Request con el id del usuario autenticado (lo asigna withUser).
declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }
  
  export {};
  