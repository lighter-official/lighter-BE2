import { Module } from '@nestjs/common';
import { WritingService } from './writing.service';
import { WritingController } from './writing.controller';
import { UserBadgeModule } from 'src/context/reward/userBadge/userBadge.module';

@Module({
  imports: [UserBadgeModule],
  controllers: [WritingController],
  providers: [WritingService],
})
export class WritingModule {}
