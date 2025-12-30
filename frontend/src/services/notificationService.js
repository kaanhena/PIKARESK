import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export async function createNotification({ toUid, type, title, body, meta = {} }) {
  if (!toUid) return null;
  const fromUid = meta.fromUid || "";
  const payload = {
    toUid,
    fromUid,
    type,
    title,
    body,
    meta,
    read: false,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "notifications"), payload);
  return { id: ref.id, ...payload };
}

export function listenNotifications(uid, onChange, maxResults = 20) {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("toUid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    onChange(items);
  });
}

export async function markNotificationRead(id) {
  if (!id) return;
  const ref = doc(db, "notifications", id);
  await updateDoc(ref, { read: true });
}

export async function markAllNotificationsRead(uid) {
  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("toUid", "==", uid), where("read", "==", false));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });
  await batch.commit();
}
