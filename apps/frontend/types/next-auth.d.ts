import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    wallet: string
    name?: string | null
    email?: string | null
    role?: string
    token: string
  }

  interface Session {
    user: {
      id: string
      wallet: string
      name?: string | null
      email?: string | null
      role?: string
      token: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string
      wallet: string
      name?: string | null
      email?: string | null
      role?: string
      token: string
    }
  }
}
