import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import prisma from "./lib/prisma";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [Google, Facebook],
  callbacks: {
    /**
     * The JWT callback is called first.
     * It enriches the token with data from your database.
     */
    async jwt({ token, user }) {
      // On initial sign-in, user object is available
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
             companies: {
              include: {
                company: true,}
             } },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.companies = dbUser.companies.map((c) => c.company);
          token.role = dbUser.role; 
        }
      }
      return token;
    },

    /**
     * The session callback is called next.
     * It receives the token from the JWT callback and formats the session object.
     */
    async session({ session, token }) {
      // The token contains our custom data.
      // We pass it to the session object.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.companies = token.companies;
         session.user.role = token.role;
      }
      return session;
    },
    
    async signIn({ user }) {
      try {
        if (!user.email) {
          return false;
        }
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          });
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
  },
});