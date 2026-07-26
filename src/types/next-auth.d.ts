// Augmentação de tipos do NextAuth.js para incluir role
import 'next-auth'

declare module '@auth/core/types' {
  interface User {
    role?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
  }
}
