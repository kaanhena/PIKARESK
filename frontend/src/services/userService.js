// src/services/userService.js
import { db } from "../firebase";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

export async function ensureUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const displayName = user.displayName || "";
  const email = user.email || "";
  const profilePayload = {
    uid: user.uid,
    email,
    displayName,
    emailLower: email.toLowerCase(),
    displayNameLower: displayName.toLowerCase(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...profilePayload,
      createdAt: serverTimestamp(),
    });
  } else {
    const data = snap.data() || {};
    const needsLower =
      !data.emailLower ||
      !data.displayNameLower ||
      data.emailLower !== profilePayload.emailLower ||
      data.displayNameLower !== profilePayload.displayNameLower;
    if (needsLower) {
      await setDoc(ref, profilePayload, { merge: true });
    }
  }

  return ref;
}

export async function fetchUserCount() {
  const usersRef = collection(db, "users");
  const snapshot = await getCountFromServer(usersRef);
  return snapshot.data().count;
}
