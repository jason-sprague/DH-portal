import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './lib/prisma';
import { authConfig } from './auth.config';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Resend from 'next-auth/providers/resend';

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  ...authConfig, // Spread the base config (including the 'authorized' callback)
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "no-reply@dykstrahamel.com"
    }),
    Google({
      allowDangerousEmailAccountLinking: true
    }), 
    Facebook({
      allowDangerousEmailAccountLinking: true
    }), 
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks, // Keep the authorized callback from the base config

    // The session callback here OVERRIDES the simple one from auth.config.ts.
    // This version accesses the database to add the user's companies.
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;

        const userWithCompanies = await prisma.user.findUnique({
          where: { id: token.sub },
          include: {
            companies: {
              include: {
                company: true,
              },
            },
          },
        });

        session.user.companies = userWithCompanies?.companies.map(c => c.company) ?? [];
      }
      return session;
    },
  },
});