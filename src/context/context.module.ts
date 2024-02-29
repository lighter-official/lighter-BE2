import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { GlooingModule } from './glooing/glooing.module';

@Module({
  imports: [AccountModule, GlooingModule],
})
export class ContextModule {}
