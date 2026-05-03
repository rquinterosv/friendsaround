import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let app

function getFirebaseAdmin() {
  if (!app) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    })
  }
  
  return { app, auth: getAuth(app) }
}

export async function verifyToken(token) {
  try {
    const { auth } = getFirebaseAdmin()
    const decoded = await auth.verifyIdToken(token)
    return decoded
  } catch (err) {
    console.error('Token verification failed:', err)
    return null
  }
}
