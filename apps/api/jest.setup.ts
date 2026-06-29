import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './src/app.module';

declare global {
  // eslint-disable-next-line no-var
  var __E2E_APP__: INestApplication | undefined;
}

// Suppress specific warnings that don't affect tests
const originalError = console.error;
beforeAll(async () => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
  process.env.DB_TYPE = 'sqlite';
  process.env.DB_NAME = ':memory:';
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_MIGRATIONS_RUN = 'false';

  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();
  globalThis.__E2E_APP__ = app;

  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('experimental') ||
        args[0].includes('Warning:') ||
        args[0].includes('DeprecationWarning'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(async () => {
  if (globalThis.__E2E_APP__) {
    await globalThis.__E2E_APP__.close();
    globalThis.__E2E_APP__ = undefined;
  }

  console.error = originalError;
});

// Give the app plenty of time to initialize
jest.setTimeout(30000);
