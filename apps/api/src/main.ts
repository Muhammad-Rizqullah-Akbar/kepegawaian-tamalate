import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { AllExceptionsFilter } from './platform/http/all-exceptions.filter';
import { ResponseInterceptor } from './platform/http/response.interceptor';

const ROOT_ENV = resolve(__dirname, '../../../.env');
loadDotenv({ path: ROOT_ENV });
loadDotenv({ path: ROOT_ENV + '.local', override: true });

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
  );
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
    },
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();
  const port = Number(process.env.APP_PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log('API siap pada port ' + port);
}

void bootstrap();
