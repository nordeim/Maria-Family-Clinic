import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { PrismaClient } from '@prisma/client'
import { supabase } from '@/lib/supabase'

// Providers
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  }),
  // Email provider for authentication without external services
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
    maxAge: 24 * 60 * 60, // 24 hours
    sendVerificationRequest: async ({ identifier, url }) => {
      // For development - just log the verification URL
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Email verification URL:', url)
        return
      }
      
      // In production, implement proper email sending
      // Example with Resend, SendGrid, etc.
      // await resend.emails.send({
      //   from: 'noreply@your-domain.com',
      //   to: identifier,
      //   subject: 'Verify your email address',
      //   html: `Click <a href="${url}">here</a> to verify your email address.`,
      // })
    },
  }),
]

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(new PrismaClient()),
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'my-family-clinic-session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: any
      account: any
      profile: any
    }) {
      // Additional sign-in validation
      if (user.email) {
        // Check if email is from allowed domains (for healthcare context)
        const allowedDomains = [
          'gmail.com',
          'yahoo.com',
          'hotmail.com',
          'outlook.com',
          'singhealth.com.sg',
          'nhg.com.sg',
          'nuhs.edu.sg',
        ]
        
        const domain = user.email.split('@')[1]
        if (!allowedDomains.includes(domain)) {
          console.warn(`Email domain ${domain} not in allowed list`)
          // Allow sign-in but log for review
        }
      }
      return true
    },
    async jwt({
      token,
      user,
    }: {
      token: any
      user?: any
    }) {
      // Add custom claims to JWT token
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({
      session,
      token,
    }: {
      session: any
      token: any
    }) {
      // Add user info to session
      if (session.user) {
        session.user.id = token.userId
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
  },
  events: {
    async signIn({
      user,
      account,
    }: {
      user: any
      account: any
    }) {
      // Log successful sign-ins
      console.log(`✅ User signed in: ${user.email} via ${account?.provider}`)
      
      // You could also log to database for audit purposes
      // await logAuditEvent({
      //   action: 'user_signed_in',
      //   userId: user.id,
      //   metadata: { provider: account?.provider },
      // })
    },
    async signOut({
      session,
      token,
    }: {
      session: any
      token: any
    }) {
      // Log sign-outs
      console.log(`🚪 User signed out: ${token?.email}`)
    },
    async createUser({
      user,
    }: {
      user: any
    }) {
      // Log new user creation
      console.log(`👤 New user created: ${user.email}`)
      
      // You could send welcome email, create user profile, etc.
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/auth/welcome',
  },
}

export default NextAuth(authOptions)
export const { auth, signIn, signOut } = NextAuth(authOptions)

/**
 * Helper function to get the current session on the server
 */
export const getServerAuthSession = async () => {
  return await auth()
}