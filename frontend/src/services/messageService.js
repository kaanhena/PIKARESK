import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { fetchUserSettings } from "./settingsService.js";

export function buildThreadId(uidA, uidB) {
  return [uidA, uidB].sort().join("__");
}

export async function sendMessage({ fromUid, toUid, text, attachment }) {
  const messageText = (text || "").trim();
  if (!fromUid || !toUid || (!messageText && !attachment)) return null;
  const recipientSettings = await fetchUserSettings(toUid);
  if (recipientSettings.dmPrivacy === "none") {
    throw new Error("Bu kullanıcı mesaj almak istemiyor.");
  }
  if (recipientSettings.dmPrivacy === "friends") {
    const isFriend = await checkFriendship(fromUid, toUid);
    if (!isFriend) {
      throw new Error("Sadece arkadaşlardan mesaj kabul ediliyor.");
    }
  }
  const threadId = buildThreadId(fromUid, toUid);
  const participants = [fromUid, toUid];
  const payload = {
    threadId,
    fromUid,
    toUid,
    participants,
    type: attachment ? "file" : "text",
    text: messageText,
    attachment: attachment || null,
    readBy: [fromUid],
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "messages"), payload);
  return { id: ref.id, ...payload };
}

async function checkFriendship(uidA, uidB) {
  const requestsRef = collection(db, "friendRequests");
  const q1 = query(
    requestsRef,
    where("fromUid", "==", uidA),
    where("toUid", "==", uidB),
    where("status", "==", "accepted"),
    limit(1)
  );
  const q2 = query(
    requestsRef,
    where("fromUid", "==", uidB),
    where("toUid", "==", uidA),
    where("status", "==", "accepted"),
    limit(1)
  );
  const [snapA, snapB] = await Promise.all([getDocs(q1), getDocs(q2)]);
  return !snapA.empty || !snapB.empty;
}

export function listenThreadMessages(threadId, uid, onChange, onError) {
  if (!threadId || !uid) return () => {};
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("threadId", "==", threadId),
    where("participants", "array-contains", uid),
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

export function listenUserMessages(uid, onChange, onError, maxResults = 200) {
  if (!uid) return () => {};
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("participants", "array-contains", uid),
    orderBy("createdAt", "desc"),
    limit(maxResults)
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

export async function markThreadRead(threadId, uid) {
  if (!threadId || !uid) return;
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("threadId", "==", threadId),
    where("toUid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  const updates = snap.docs
    .map((docSnap) => {
      const data = docSnap.data();
      if (Array.isArray(data.readBy) && data.readBy.includes(uid)) return null;
      return updateDoc(docSnap.ref, { readBy: [...(data.readBy || []), uid] });
    })
    .filter(Boolean);
  await Promise.all(updates);
}
