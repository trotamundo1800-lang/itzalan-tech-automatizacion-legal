import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';

  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }

  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT debe ser un entero positivo');
  }

  // ===== SECURITY: Helmet =====
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // ===== SECURITY: Rate Limiting =====
  // In development we disable request throttling to avoid blocking local E2E/browser flows.
  if (!isDevelopment) {
    const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000); // 15 min
    const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);

    const limiter = rateLimit({
      windowMs: rateLimitWindowMs,
      max: rateLimitMaxRequests,
      message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting para endpoints de health check
        return req.path === '/health' || req.path === '/';
      },
    });

    app.use(limiter);
  }

  // ===== CORS =====
  const corsOriginsRaw =
    process.env.CORS_ORIGINS ??
    process.env.CORS_ORIGIN ??
    'http://localhost:3000,http://localhost:3001';
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Always allow local web app hosts in development, even if env config is stale.
  const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const allowedOrigins = isDevelopment
    ? Array.from(new Set([...corsOrigins, ...devOrigins]))
    : corsOrigins;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });

  // ===== GLOBAL PIPES =====
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ===== GLOBAL FILTERS & INTERCEPTORS =====
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  console.log(`✅ API ejecutándose en http://localhost:${port}`);
  console.log(`📋 Documentación: http://localhost:${port}/api`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});
