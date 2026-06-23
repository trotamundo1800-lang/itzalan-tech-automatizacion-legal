import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }

  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT debe ser un entero positivo');
  }

  const corsOriginsRaw =
    process.env.CORS_ORIGINS ??
    process.env.CORS_ORIGIN ??
    'http://localhost:3000,http://localhost:3001';
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(port);
  console.log(`API ejecutandose en http://localhost:${port}`);
}

bootstrap();
