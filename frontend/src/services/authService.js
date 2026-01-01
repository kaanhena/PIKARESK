// src/services/authService.js
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export async function register(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred.user;
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function reauthenticate(currentPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Kullanıcı bulunamadı.");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return user;
}

export async function updateAccountProfile({ displayName }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı bulunamadı.");
  await updateProfile(user, { displayName: displayName || "" });
  return user;
}

export async function updateAccountEmail(newEmail, currentPassword) {
  const user = await reauthenticate(currentPassword);
  await updateEmail(user, newEmail);
  return user;
}

export async function updateAccountPassword(newPassword, currentPassword) {
  const user = await reauthenticate(currentPassword);
  await updatePassword(user, newPassword);
  return user;
}

export async function deleteAccount(currentPassword) {
  if (currentPassword) {
    await reauthenticate(currentPassword);
  }
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı bulunamadı.");
  await deleteUser(user);
}
