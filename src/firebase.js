import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
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
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  return result
}

export const checkRedirectResult = () => getRedirectResult(auth)
export const logout = () => signOut(auth)
