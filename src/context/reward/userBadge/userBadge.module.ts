import { Module } from '@nestjs/common';
import { UserBadgeController } from './userBadge.controller';
import { UserBadgeService } from './userBadge.service';

@Module({
  controllers: [UserBadgeController],
  providers: [UserBadgeService],
  exports: [UserBadgeService],
})
export class UserBadgeModule {}
