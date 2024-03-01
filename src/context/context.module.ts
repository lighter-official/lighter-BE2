import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { GlooingModule } from './glooing/glooing.module';
import { RewardModule } from './reward/reward.module';

@Module({
  imports: [AccountModule, GlooingModule, RewardModule],
})
export class ContextModule {}
