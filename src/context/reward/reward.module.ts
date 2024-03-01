import { Module } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { BadgeModule } from './badge/badge.module';
import { UserBadgeModule } from './userBadge/userBadge.module';

@Module({
  imports: [BadgeModule, UserBadgeModule],
  controllers: [RewardController],
  providers: [RewardService],
})
export class RewardModule {}
