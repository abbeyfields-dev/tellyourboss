import dotenv from 'dotenv';

dotenv.config();

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/\r/g, '').trim();
}

export const env = {
  nodeEnv: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  port: parseInt(process.env.PORT || '8080', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  mailFrom: process.env.MAIL_FROM || 'Boss-O-Rater <noreply@bossorater.com>',
  webAppUrl: (process.env.WEB_APP_URL || 'https://bossorater.com').replace(/\/$/, ''),
} as const;
