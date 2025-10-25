import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

export const authOptions: AuthOptions = {

  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) {
          return null
        }

        try {
          const response = await axios.post(
            "http://localhost:8000/api/auth/siwe", // your express API endpoint
            {
              message: credentials.message,
              signature: credentials.signature,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          )

          const user = response.data.user
          console.log("✅ User from backend:", user)

          if (user && user.address) {
            const userObj = {
              id: user.id,
              wallet: user.address,
              name: user.name || null,
              email: user.email || null,
              role: user.role,
              onboardingStatus: user.onboardingStatus,
              bio: user.bio,
              avatar: user.avatar,
              location: user.location,
              website: user.website,
              twitter: user.twitter,
              github: user.github,
              linkedin: user.linkedin,
              discord: user.discord,
              telegram: user.telegram,
              badges: user.badges,
              orgName: user.orgName,
              orgWebsite: user.orgWebsite,
              token: response.data.token,
            }
            console.log("✅ Returning user object:", userObj)
            return userObj
          }

          return null
        } catch (error: any) {
          console.error("❌ SIWE authorize error:", error?.response?.data || error.message)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = user
        console.log("✅ JWT callback - user added to token:", token.user)
      }
      
      // Update token when session is updated
      if (trigger === "update" && session) {
        token.user = { ...(token.user as any), ...(session as any) }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as any
        console.log("✅ Session callback - user in session:", session.user)
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
