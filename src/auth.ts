import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient();

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) {
          return false
        }
        // Check if the user exists in the database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create a new user without a company
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          });
        }

        return true; // Allow the sign-in
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false; // Prevent the sign-in
      }
    },
  },
});