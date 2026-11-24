import app from './app';
import { env } from './config/env';

app.listen(env.port, '0.0.0.0', () => {
  console.log(`[BOOT] Boss-Rater API on port ${env.port} | ${env.nodeEnv}`);
});
