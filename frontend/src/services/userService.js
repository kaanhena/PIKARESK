// src/services/userService.js
import { db } from "../firebase";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  onSnapshot,
  deleteDoc,
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
    bio: "",
    bannerColor: "#ff00e6",
    avatarText: "",
    avatarColor: "#6b5cff",
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
    const needsDefaults =
      typeof data.bio === "undefined" ||
      typeof data.bannerColor === "undefined" ||
      typeof data.avatarText === "undefined" ||
      typeof data.avatarColor === "undefined";
    if (needsLower) {
      await setDoc(ref, profilePayload, { merge: true });
    }
    if (needsDefaults) {
      await setDoc(
        ref,
        {
          bio: "",
          bannerColor: "#ff00e6",
          avatarText: "",
          avatarColor: "#6b5cff",
        },
        { merge: true }
      );
    }
  }

  return ref;
}

export function listenUserProfile(uid, onChange, onError) {
  if (!uid) return () => {};
  const ref = doc(db, "users", uid);
  return onSnapshot(
    ref,
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function updateUserProfile(uid, updates) {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteUserProfile(uid) {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await deleteDoc(ref);
}

export async function fetchUserCount() {
  const usersRef = collection(db, "users");
  const snapshot = await getCountFromServer(usersRef);
  return snapshot.data().count;
}
