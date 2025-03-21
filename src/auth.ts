import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Discord],
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET,
});
