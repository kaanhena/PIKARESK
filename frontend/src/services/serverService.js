import {
  addDoc,
  collection,
  doc,
  documentId,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

const SERVERS_COLLECTION = "servers";
const MEMBERS_COLLECTION = "serverMembers";
const INVITES_COLLECTION = "serverInvites";
const USER_SERVERS_COLLECTION = "userServers";
const MESSAGES_COLLECTION = "serverMessages";
const VOICE_SETTINGS_COLLECTION = "voiceSettings";

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function createServerForUser({ uid, name, userName }) {
  if (!uid || !name) throw new Error("Eksik bilgi.");
  const userServerRef = doc(db, USER_SERVERS_COLLECTION, uid);
  const existing = await getDoc(userServerRef);
  if (existing.exists()) {
    throw new Error("Bu hesap icin zaten bir sunucu var.");
  }

  const serverRef = doc(collection(db, SERVERS_COLLECTION));
  const memberRef = doc(db, MEMBERS_COLLECTION, `${serverRef.id}_${uid}`);
  const now = serverTimestamp();

  const batch = writeBatch(db);
  batch.set(serverRef, {
    name,
    ownerId: uid,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(memberRef, {
    serverId: serverRef.id,
    userId: uid,
    role: "owner",
    userName: userName || "Kullanici",
    joinedAt: now,
  });
  batch.set(userServerRef, {
    serverId: serverRef.id,
    createdAt: now,
  });
  await batch.commit();
  return { id: serverRef.id, name, ownerId: uid };
}

export function listenUserServers(uid, onChange, onError) {
  if (!uid) return () => {};
  const membersRef = collection(db, MEMBERS_COLLECTION);
  const membersQuery = query(membersRef, where("userId", "==", uid));
  let stopServers = [];

  function stopAllServers() {
    stopServers.forEach((stop) => stop());
    stopServers = [];
  }

  const stopMembers = onSnapshot(
    membersQuery,
    (snapshot) => {
      const serverIds = snapshot.docs
        .map((docSnap) => docSnap.data().serverId)
        .filter(Boolean);
      stopAllServers();
      if (!serverIds.length) {
        onChange([]);
        return;
      }
      const chunks = chunkArray([...new Set(serverIds)], 10);
      const serversMap = new Map();
      chunks.forEach((chunk) => {
        const serversQuery = query(
          collection(db, SERVERS_COLLECTION),
          where(documentId(), "in", chunk)
        );
        const stop = onSnapshot(
          serversQuery,
          (serverSnap) => {
            serverSnap.docs.forEach((serverDoc) => {
              serversMap.set(serverDoc.id, { id: serverDoc.id, ...serverDoc.data() });
            });
            onChange(Array.from(serversMap.values()));
          },
          (error) => {
            if (onError) onError(error);
          }
        );
        stopServers.push(stop);
      });
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return () => {
    stopMembers();
    stopAllServers();
  };
}

export function listenServerMembers(serverId, onChange, onError) {
  if (!serverId) return () => {};
  const membersRef = collection(db, MEMBERS_COLLECTION);
  const q = query(membersRef, where("serverId", "==", serverId));
  return onSnapshot(
    q,
    (snapshot) => {
      const members = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onChange(members);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createInvite({ serverId, createdBy }) {
  if (!serverId || !createdBy) throw new Error("Eksik bilgi.");
  let code = "";
  for (let i = 0; i < 3; i += 1) {
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    code = `${serverId.slice(0, 6).toUpperCase()}-${token}`;
    const ref = doc(db, INVITES_COLLECTION, code);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, {
        serverId,
        createdBy,
        createdAt: serverTimestamp(),
      });
      return code;
    }
  }
  throw new Error("Davet kodu olusturulamadi.");
}

export async function joinServerByInvite({ code, uid, userName }) {
  if (!code || !uid) throw new Error("Eksik bilgi.");
  const inviteRef = doc(db, INVITES_COLLECTION, code);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) {
    throw new Error("Davet kodu bulunamadi.");
  }
  const serverId = inviteSnap.data().serverId;
  const memberRef = doc(db, MEMBERS_COLLECTION, `${serverId}_${uid}`);
  await setDoc(
    memberRef,
    {
      serverId,
      userId: uid,
      role: "member",
      userName: userName || "Kullanici",
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return serverId;
}

export function listenServerMessages(serverId, onChange, onError, maxResults = 200) {
  if (!serverId) return () => {};
  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    where("serverId", "==", serverId),
    orderBy("createdAt", "asc"),
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

export async function sendServerMessage({ serverId, uid, userName, text }) {
  const messageText = (text || "").trim();
  if (!serverId || !uid || !messageText) return null;
  const payload = {
    serverId,
    userId: uid,
    userName: userName || "Kullanici",
    text: messageText,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, MESSAGES_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function loadVoiceSettings(uid) {
  if (!uid) return null;
  const ref = doc(db, VOICE_SETTINGS_COLLECTION, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function saveVoiceSettings(uid, settings) {
  if (!uid) return;
  const ref = doc(db, VOICE_SETTINGS_COLLECTION, uid);
  if (!settings) return;
  await setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateServerActivity(serverId) {
  if (!serverId) return;
  const ref = doc(db, SERVERS_COLLECTION, serverId);
  await updateDoc(ref, { updatedAt: serverTimestamp() });
}
