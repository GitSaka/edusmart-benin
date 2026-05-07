// types/next-auth-middleware.d.ts
import "next/server";

declare module "next/server" {
  interface NextRequest {
    auth?: {
      user: {
        id: string;
        role: string;
        name?: string | null;
        email?: string | null;
      };
    };
  }
}