import { Module } from '@nestjs/common';
import { WritingSessionService } from './writing-session.service';
import { WritingSessionController } from './writing-session.controller';
import { UserBadgeModule } from 'src/context/reward/userBadge/userBadge.module';

@Module({
  imports: [UserBadgeModule],
  controllers: [WritingSessionController],
  providers: [WritingSessionService],
  exports: [WritingSessionService],
})
export class WritingSessionModule {}
