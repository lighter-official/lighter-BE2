import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBModule } from './db/db.module';
import { ContextModule } from './context/context.module';
import { InjectAccountMiddleware } from './middlewares/InjectAccount.middleware';
import { KakaoModule } from './service/kakao/kakao.module';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    DBModule,
    ContextModule,
    KakaoModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true, global: true }),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InjectAccountMiddleware).forRoutes('*');
  }
}
