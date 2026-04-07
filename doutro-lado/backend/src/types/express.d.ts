import "express";
import type { Role } from "./domain.js";

declare global {
  namespace Express {
    interface UserPayload {
      /** Supabase auth.users UUID — used for audit and token identity. */
      id: string;
      /** profiles.id — used for all business-logic DB queries. */
      profileId: string;
      email: string;
      role: Role;
      isActive: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
