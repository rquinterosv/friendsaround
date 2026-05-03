import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, getRedirectResult } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCYWUXSvr8SX-FdcWvjD6RH7bP02817Okk",
  authDomain: "driftertrip.firebaseapp.com",
  projectId: "driftertrip",
  storageBucket: "driftertrip.firebasestorage.app",
  messagingSenderId: "260587384920",
  appId: "1:260587384920:web:eaa2321e4446d573f31a2d",
  measurementId: "G-XBGKJ3CER2"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  
  // Sync user to database
  if (result.user) {
    const { syncUser } = await import('./lib/api.js')
    await syncUser({
      firebase_uid: result.user.uid,
      email: result.user.email,
      full_name: result.user.displayName
    })
  }
  
  return result
}

export const checkRedirectResult = () => getRedirectResult(auth)
export const logout = () => signOut(auth)
