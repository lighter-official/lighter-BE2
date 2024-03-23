import { Module } from '@nestjs/common';
import { WritingService } from './writing.service';
import { WritingController } from './writing.controller';
import { UserBadgeModule } from 'src/context/reward/userBadge/userBadge.module';
import { WritingSessionModule } from '../writing-session/writing-session.module';

@Module({
  imports: [UserBadgeModule, WritingSessionModule],
  controllers: [WritingController],
  providers: [WritingService],
})
export class WritingModule {}
