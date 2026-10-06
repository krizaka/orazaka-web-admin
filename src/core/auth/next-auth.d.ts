import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      /** The identity service's session JWT, replayed as the Bearer token by the BFF. */
      token?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionToken?: string;
  }
}
