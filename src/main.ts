import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend applications
  app.enableCors({
    origin: [
      'http://localhost:3003', // Admin frontend
      'http://localhost:3004', // Public frontend
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure session middleware
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'your_session_secret_key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,  // 👈 must be false for HTTP. In production, when using HTTPS, it should be true. Otherwise, the browser will not send cookies over HTTPS for security reasons.
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    }),
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3002);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
