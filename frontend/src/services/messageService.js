import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export function buildThreadId(uidA, uidB) {
  return [uidA, uidB].sort().join("__");
}

export async function sendMessage({ fromUid, toUid, text }) {
  if (!fromUid || !toUid || !text) return null;
  const threadId = buildThreadId(fromUid, toUid);
  const payload = {
    threadId,
    fromUid,
    toUid,
    text,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "messages"), payload);
  return { id: ref.id, ...payload };
}

export function listenThreadMessages(threadId, onChange, onError) {
  if (!threadId) return () => {};
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("threadId", "==", threadId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onChange(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}
