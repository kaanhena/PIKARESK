import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { livekitRoutes } from './livekit.routes.js';
// ileride: import { authRoutes } from './auth.routes.js';

export const routes = Router();

routes.use('/health', healthRoutes);
routes.use('/livekit', livekitRoutes);
// routes.use('/auth', authRoutes);
