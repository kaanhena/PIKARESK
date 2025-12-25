import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { routes } from './routes/index.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  if (env.corsOrigin) {
    app.use(cors({ origin: env.corsOrigin }));
  } else {
    app.use(cors());
  }

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
