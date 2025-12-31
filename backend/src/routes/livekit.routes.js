import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { env } from '../config/env.js';

export const livekitRoutes = Router();

livekitRoutes.post('/token', (req, res) => {
  const { room, identity, name } = req.body || {};
  if (!env.livekitUrl || !env.livekitApiKey || !env.livekitApiSecret) {
    return res.status(500).json({ message: 'LiveKit ayarlari eksik.' });
  }
  if (!room || !identity) {
    return res.status(400).json({ message: 'room ve identity zorunlu.' });
  }

  const token = new AccessToken(env.livekitApiKey, env.livekitApiSecret, {
    identity,
    name: name || identity
  });
  token.addGrant({ roomJoin: true, room });
  return res.json({ token: token.toJwt(), url: env.livekitUrl });
});
