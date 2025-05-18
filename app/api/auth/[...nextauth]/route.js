import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { usersTable } from "@/configs/schema";
import { eq } from "drizzle-orm";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, credentials.email))
          .limit(1);

        const user = users[0];
        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, user.email))
          .limit(1);

        if (users.length === 0) {
          // Block sign-in if user with this email doesn't exist
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const users = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, token.email))
          .limit(1);

        const dbUser = users[0];
        if (!dbUser) {
          // User not found, reject token
          return null;
        }

        token.id = dbUser.id;
        token.role = dbUser.role;
      }

      if (user && account?.provider !== "google") {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
