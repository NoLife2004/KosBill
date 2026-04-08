import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";

// Initialize Better Auth with the database connection and admin plugin
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),

  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Trusted origins for CORS and security
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL || "",
    "https://*.vercel.run",
  ].filter(Boolean),

  // Email and password authentication (no email verification required)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Admin plugin - defaultRole ensures new users get role; databaseHooks fix OAuth/migration edge cases
  plugins: [admin({ defaultRole: "user" })],

  // CRITICAL: Ensures role is always set - fixes "could not assign role when login" in generated apps
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          if (!createdUser.role) {
            await db.update(schema.user).set({ role: "user" }).where(eq(schema.user.id, createdUser.id));
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          const userRecord = await db.query.user.findFirst({ where: eq(schema.user.id, session.userId) });
          if (userRecord && !userRecord.role) {
            await db.update(schema.user).set({ role: "user" }).where(eq(schema.user.id, session.userId));
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;
