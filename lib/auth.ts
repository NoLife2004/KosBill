import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { sendEmail } from "./email";

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

  // Email verification settings (moved to top level as recommended by docs)
  emailVerification: {
    sendOnSignUp: true, // Auto send on signup
    sendVerificationEmail: async (data: { user: { email: string; name: string }; url: string; token: string }, request?: Request) => {
      console.log(`[Better Auth] INITIATING: Verification email to ${data.user.email}`);
      console.log(`[Better Auth] URL Generated: ${data.url}`);
      
      try {
        await sendEmail({
          to: data.user.email,
          subject: "Verify your email - KosBill Reminder",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to KosBill!</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Hello ${data.user.name},</p>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Please verify your email address to complete your registration.</p>
              <div style="margin: 35px 0;">
                <a href="${data.url}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">If you didn't create an account, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">KosBill Reminder Team</p>
            </div>
          `,
        });
        console.log(`[Better Auth] DONE: Verification email sent to ${data.user.email}`);
      } catch (error: any) {
        console.error(`[Better Auth] ERROR sending verification email:`, error?.message || error);
      }
    },
  },

  // Email and password authentication with reset functionality
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async (data: { user: { email: string; name: string }; url: string; token: string }, request?: Request) => {
      console.log(`[Better Auth] INITIATING: Password reset email to ${data.user.email}`);
      try {
        await sendEmail({
          to: data.user.email,
          subject: "Reset your password - KosBill Reminder",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #2563eb; margin-bottom: 20px;">Reset Password Request</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Hello ${data.user.name},</p>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">Click the button below to reset your password. This link will expire in 1 hour.</p>
              <div style="margin: 35px 0;">
                <a href="${data.url}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">KosBill Reminder Team</p>
            </div>
          `,
        });
        console.log(`[Better Auth] DONE: Password reset email sent to ${data.user.email}`);
      } catch (error: any) {
        console.error(`[Better Auth] ERROR sending reset password email:`, error?.message || error);
      }
    },
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
