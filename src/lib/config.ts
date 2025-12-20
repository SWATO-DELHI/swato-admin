// Configuration and setup for the food delivery admin panel

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  app: {
    name: 'Swato Admin',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@swato.com',
  },
  maps: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  payment: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
  },
  storage: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
} as const;

export type Config = typeof config;











