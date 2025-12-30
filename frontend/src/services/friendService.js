import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./notificationService.js";

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

function buildUserLabel(user) {
  return user.displayName || user.email || user.uid;
}

export async function findUserByIdentity(input) {
  const term = normalize(input);
  if (!term) return null;
  const usersRef = collection(db, "users");
  const byEmail = query(usersRef, where("emailLower", "==", term), limit(1));
  const byName = query(usersRef, where("displayNameLower", "==", term), limit(1));
  const [emailSnap, nameSnap] = await Promise.all([getDocs(byEmail), getDocs(byName)]);
  let docSnap = emailSnap.docs[0] || nameSnap.docs[0];
  if (!docSnap) {
    const fallbackEmail = query(usersRef, where("email", "==", input.trim()), limit(1));
    const fallbackName = query(usersRef, where("displayName", "==", input.trim()), limit(1));
    const [fallbackEmailSnap, fallbackNameSnap] = await Promise.all([
      getDocs(fallbackEmail),
      getDocs(fallbackName),
    ]);
    docSnap = fallbackEmailSnap.docs[0] || fallbackNameSnap.docs[0];
  }
  if (!docSnap) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function fetchFriendRequests(uid) {
  const requestsRef = collection(db, "friendRequests");
  const incoming = query(requestsRef, where("toUid", "==", uid));
  const outgoing = query(requestsRef, where("fromUid", "==", uid));
  const [incomingSnap, outgoingSnap] = await Promise.all([
    getDocs(incoming),
    getDocs(outgoing),
  ]);
  const items = [
    ...incomingSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
    ...outgoingSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })),
  ];
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function sendFriendRequest(fromUser, toUser) {
  const requestsRef = collection(db, "friendRequests");
  const existingOutgoing = query(
    requestsRef,
    where("fromUid", "==", fromUser.uid),
    where("toUid", "==", toUser.id)
  );
  const existingIncoming = query(
    requestsRef,
    where("fromUid", "==", toUser.id),
    where("toUid", "==", fromUser.uid)
  );
  const [outSnap, inSnap] = await Promise.all([
    getDocs(existingOutgoing),
    getDocs(existingIncoming),
  ]);
  const existing = outSnap.docs[0] || inSnap.docs[0];
  if (existing) {
    return { id: existing.id, ...existing.data() };
  }

  const payload = {
    fromUid: fromUser.uid,
    fromName: buildUserLabel(fromUser),
    fromEmail: fromUser.email || "",
    toUid: toUser.id,
    toName: buildUserLabel(toUser),
    toEmail: toUser.email || "",
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(requestsRef, payload);
  try {
    await createNotification({
      toUid: toUser.id,
      type: "friend_request",
      title: "Arkadaslik istegi",
      body: `${payload.fromName} sana arkadaslik istegi gonderdi.`,
      meta: { fromUid: fromUser.uid },
    });
  } catch {
    // ignore notification errors
  }
  return { id: docRef.id, ...payload };
}

export async function updateFriendRequest(requestId, updates) {
  const ref = doc(db, "friendRequests", requestId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function removeFriendRequest(requestId) {
  const ref = doc(db, "friendRequests", requestId);
  await deleteDoc(ref);
}

export async function fetchAcceptedFriends(uid) {
  const requests = await fetchFriendRequests(uid);
  return requests
    .filter((req) => req.status === "accepted")
    .map((req) => {
      const isOutgoing = req.fromUid === uid;
      return {
        id: isOutgoing ? req.toUid : req.fromUid,
        name: isOutgoing ? req.toName : req.fromName,
        email: isOutgoing ? req.toEmail : req.fromEmail,
      };
    });
}
