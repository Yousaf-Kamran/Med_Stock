import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./config";

export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}
