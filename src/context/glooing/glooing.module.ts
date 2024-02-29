import { Module } from '@nestjs/common';
import { GlooingService } from './glooing.service';
import { GlooingController } from './glooing.controller';
import { WritingSessionModule } from './writing-session/writing-session.module';

@Module({
  imports: [WritingSessionModule],
  controllers: [GlooingController],
  providers: [GlooingService],
})
export class GlooingModule {}
