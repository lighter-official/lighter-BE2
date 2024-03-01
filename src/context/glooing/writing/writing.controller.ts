import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { WritingService } from './writing.service';
import { CreateWritingDto } from './writing.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/context/account/account.constant';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';

@Controller('writings')
export class WritingController {
  constructor(private readonly writingService: WritingService) {}

  @Get(':writingId')
  @Roles(ROLE.USER)
  getWriting(
    @User() user: TUser,
    @Param('writingId', ParseIntPipe) writingId: number,
  ) {
    return this.writingService.getWriting(user, writingId);
  }

  @Post()
  @Roles(ROLE.USER)
  createWriting(
    @User() user: TUser,
    @Body() createWritingDto: CreateWritingDto,
  ) {
    return this.writingService.createWriting(user, createWritingDto);
  }

  @Put(':writingId')
  @Roles(ROLE.USER)
  updateWriting(
    @User() user: TUser,
    @Param('writingId', ParseIntPipe) writingId: number,
    @Body() createWritingDto: CreateWritingDto,
  ) {
    return this.writingService.updateWriting(user, writingId, createWritingDto);
  }
}
