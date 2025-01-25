import { Elysia, Cookie } from 'elysia'
import admin from 'firebase-admin'

if (!admin?.apps?.length) {
  console.log("ℹ️ Initializing Firebase Admin...")
  admin?.initializeApp()
} else {
  console.log("✅ Firebase Admin already initialized")
}

const getTokenCookies = (cookies: Record<string, Cookie<string | undefined>>) => {
  const idToken = cookies?.idToken?.value || ''
  const refreshToken = cookies?.refreshToken?.value || ''
  return { idToken, refreshToken }
}

export const firebaseAuth = new Elysia()
  .derive(({ request, cookie, set }): { token: string | undefined; error?: string } => {
    const { idToken } = getTokenCookies(cookie)
    const token = idToken || request.headers.get('authorization')?.split(' ')[1]
    
    if (!token) {
      set.status = 401
      return { token: undefined, error: 'Unauthorized: No token provided' }
    }
    
    return { token }
  })
  .derive(async ({ token, set }) => {
    if (!token) {
      set.status = 401
      return { error: 'Unauthorized: No token provided' }
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)
      return { user: decodedToken }
    } catch (error) {
      console.error('Firebase Auth Error:', error)
      set.status = 401
      return { error: 'Unauthorized: Invalid token' }
    }
  })
  .onError(({ code, error, set }) => {
    set.status = code === 'VALIDATION' ? 400 : 500
    return { error: String(error) }
  })