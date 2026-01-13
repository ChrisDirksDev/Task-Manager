import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth API route handler
 * 
 * Note: If you encounter JWT decryption errors, it usually means:
 * 1. The NEXTAUTH_SECRET has changed
 * 2. There are old session cookies in the browser
 * 
 * Solution: Clear browser cookies for localhost:3000 or regenerate NEXTAUTH_SECRET
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

