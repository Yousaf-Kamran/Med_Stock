import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./config";

export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signupUser(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return await firebaseSignOut(auth);
}
