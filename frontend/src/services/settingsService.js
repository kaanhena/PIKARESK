import { db } from "../firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { DEFAULT_SETTINGS, normalizeSettings } from "../utils/settings.js";

function buildSettingsPayload(settings) {
  return {
    ...normalizeSettings(settings),
    updatedAt: serverTimestamp(),
  };
}

export async function ensureUserSettings(uid) {
  if (!uid) return null;
  const ref = doc(db, "userSettings", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ...DEFAULT_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const data = snap.data() || {};
    const merged = normalizeSettings(data);
    const needsDefaults = Object.keys(DEFAULT_SETTINGS).some(
      (key) => typeof data[key] === "undefined"
    );
    if (needsDefaults) {
      await setDoc(ref, { ...merged, updatedAt: serverTimestamp() }, { merge: true });
    }
  }
  return ref;
}

export async function fetchUserSettings(uid) {
  if (!uid) return normalizeSettings({});
  const ref = doc(db, "userSettings", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return normalizeSettings({});
  return normalizeSettings(snap.data());
}

export function listenUserSettings(uid, onChange, onError) {
  if (!uid) return () => {};
  const ref = doc(db, "userSettings", uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange(normalizeSettings({}));
        return;
      }
      onChange(normalizeSettings(snap.data()));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function updateUserSettings(uid, updates) {
  if (!uid) return;
  const ref = doc(db, "userSettings", uid);
  await setDoc(ref, buildSettingsPayload(updates), { merge: true });
}

export async function deleteUserSettings(uid) {
  if (!uid) return;
  const ref = doc(db, "userSettings", uid);
  await deleteDoc(ref);
}
