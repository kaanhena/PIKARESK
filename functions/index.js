const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { AccessToken } = require("livekit-server-sdk");

function getConfig() {
  const cfg = functions.config().livekit || {};
  return {
    url: cfg.url,
    apiKey: cfg.api_key,
    apiSecret: cfg.api_secret
  };
}

exports.livekitToken = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed." });
      }
      const { room, identity, name } = req.body || {};
      const { url, apiKey, apiSecret } = getConfig();
      if (!url || !apiKey || !apiSecret) {
        return res.status(500).json({ message: "LiveKit ayarlari eksik." });
      }
      if (!room || !identity) {
        return res.status(400).json({ message: "room ve identity zorunlu." });
      }

      const token = new AccessToken(apiKey, apiSecret, {
        identity,
        name: name || identity
      });
      token.addGrant({ roomJoin: true, room });
      const jwt = await token.toJwt();
      return res.json({ token: jwt, url });
    } catch (error) {
      return res.status(500).json({ message: "Token olusturulamadi." });
    }
  });
});
