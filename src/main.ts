import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import helmet from 'helmet';
import * as requestIp from 'request-ip';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // MiddleWares
  app.use(requestIp.mw());
  app.use(bodyParser.text());
  app.use(helmet());

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
