import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// This is the core of the authentication system.
// NextAuth.js handles all the complexity of OAuth with Google.

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here if needed (e.g., GitHub, Email)
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // Tell NextAuth to use our custom sign-in page
  pages: {
    signIn: '/auth/signin',
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
