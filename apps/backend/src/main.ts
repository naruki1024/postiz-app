import { loadSwagger } from '@gitroom/helpers/swagger/load.swagger';

process.env.TZ = 'UTC';

import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SubscriptionExceptionFilter } from '@gitroom/backend/services/auth/permissions/subscription.exception';
import { HttpExceptionFilter } from '@gitroom/nestjs-libraries/services/exception.filter';
import { ConfigurationChecker } from '@gitroom/helpers/configuration/configuration.checker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      credentials: true,
      exposedHeaders: ['reload', 'onboarding', 'activate'],
      origin: [
        process.env.FRONTEND_URL,
        ...(process.env.MAIN_URL ? [process.env.MAIN_URL] : []),
      ],
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  app.use(cookieParser());
  app.useGlobalFilters(new SubscriptionExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  loadSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  checkConfiguration() // Do this last, so that users will see obvious issues at the end of the startup log without having to scroll up.

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

function checkConfiguration() {
  const checker = new ConfigurationChecker();
  checker.readEnvFromProcess()
  checker.check()

  if (checker.hasIssues()) {
    for (const issue of checker.getIssues()) {
      Logger.warn(issue, 'Configuration issue')
    }

    Logger.warn("Configuration issues found: " + checker.getIssuesCount() + ". You run run `npm run command config:check` to quickly check again.")
  } else {
    Logger.log("Configuration check completed without any issues.")
  }
}

bootstrap();
