import { Module } from '@nestjs/common';
import { GlooingService } from './glooing.service';
import { GlooingController } from './glooing.controller';
import { WritingSessionModule } from './writing-session/writing-session.module';
import { WritingModule } from './writing/writing.module';

@Module({
  imports: [WritingSessionModule, WritingModule],
  controllers: [GlooingController],
  providers: [GlooingService],
})
export class GlooingModule {}
