const functions = require("firebase-functions/v1");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors")({ origin: true });
const { AccessToken } = require("livekit-server-sdk");

const livekitUrl = defineSecret("LIVEKIT_URL");
const livekitApiKey = defineSecret("LIVEKIT_API_KEY");
const livekitApiSecret = defineSecret("LIVEKIT_API_SECRET");

if (!admin.apps.length) {
  admin.initializeApp();
}

async function buildLivekitToken(payload) {
  const { room, identity, name } = payload || {};
  const url = livekitUrl.value();
  const apiKey = livekitApiKey.value();
  const apiSecret = livekitApiSecret.value();
  if (!url || !apiKey || !apiSecret) {
    const error = new Error("LiveKit ayarlari eksik.");
    error.status = 500;
    throw error;
  }
  if (!room || !identity) {
    const error = new Error("room ve identity zorunlu.");
    error.status = 400;
    throw error;
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name: name || identity
  });
  token.addGrant({ roomJoin: true, room });
  const jwt = await token.toJwt();
  return { token: jwt, url };
}

const app = express();
app.use(cors);
app.use(express.json());

async function verifyAuth(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) {
    const error = new Error("Yetkisiz.");
    error.status = 401;
    throw error;
  }
  return admin.auth().verifyIdToken(match[1]);
}

async function deleteByQuery(query) {
  const snapshot = await query.limit(500).get();
  if (snapshot.empty) return;
  const batch = admin.firestore().batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  await deleteByQuery(query);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "pikareks-api" });
});

app.post("/api/livekit/token", async (req, res) => {
  try {
    const result = await buildLivekitToken(req.body);
    res.json(result);
  } catch (error) {
    res.status(error?.status || 500).json({ message: error?.message || "Token olusturulamadi." });
  }
});

app.post("/api/servers/:serverId/delete", async (req, res) => {
  try {
    const decoded = await verifyAuth(req);
    const serverId = req.params.serverId;
    if (!serverId) {
      return res.status(400).json({ message: "Sunucu bulunamadi." });
    }
    const db = admin.firestore();
    const serverRef = db.collection("servers").doc(serverId);
    const serverSnap = await serverRef.get();
    if (!serverSnap.exists) {
      return res.status(404).json({ message: "Sunucu bulunamadi." });
    }
    const serverData = serverSnap.data();
    if (serverData?.ownerId !== decoded.uid) {
      return res.status(403).json({ message: "Bu islemi yapamazsin." });
    }

    await deleteByQuery(db.collection("serverMembers").where("serverId", "==", serverId));
    await deleteByQuery(db.collection("serverMessages").where("serverId", "==", serverId));
    await deleteByQuery(db.collection("serverInvites").where("serverId", "==", serverId));
    await deleteByQuery(db.collection("userServers").where("serverId", "==", serverId));
    await serverRef.delete();

    return res.json({ ok: true });
  } catch (error) {
    return res.status(error?.status || 500).json({ message: error?.message || "Sunucu silinemedi." });
  }
});

exports.api = functions
  .runWith({
    secrets: ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]
  })
  .https.onRequest(app);

exports.livekitToken = functions
  .runWith({
    secrets: ["LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"]
  })
  .https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed." });
      }
      const result = await buildLivekitToken(req.body);
      return res.json(result);
    } catch (error) {
      return res.status(error?.status || 500).json({ message: error?.message || "Token olusturulamadi." });
    }
  });
});
