// File: src/types/next-auth.d.ts

import { type DefaultSession, type User as DefaultUser } from "next-auth";
import { type JWT as DefaultJWT } from "next-auth/jwt";
import { type Company, type UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User extends DefaultUser {
    companies: Company[];
        role: UserRole;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    companies: Company[];
    role: UserRole;
  }
}