export const healthController = {
  get: (_req, res) => res.json({ status: 'ok', service: 'pikareks-api' })
};
