import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './db/db.module';
import { ContextModule } from './context/context.module';
import { InjectAccountMiddleware } from './middlewares/InjectAccount.middleware';

@Module({
  imports: [DBModule, ContextModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InjectAccountMiddleware).forRoutes('*');
  }
}
