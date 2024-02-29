import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WritingSessionService } from './writing-session.service';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from 'src/context/account/account.constant';
import { User } from 'src/decorators/user.decorator';
import { User as TUser } from '@prisma/client';
import {
  CreateWritingSessionDto,
  UpdateWritingSessionDto,
} from './writing-session.dto';

@Controller('writing-session')
export class WritingSessionController {
  constructor(private readonly writingSessionService: WritingSessionService) {}

  @Post()
  @Roles(ROLE.USER)
  createWritingSession(
    @User() user: TUser,
    @Body() createWritingSessionDto: CreateWritingSessionDto,
  ) {
    return this.writingSessionService.createWritingSession(
      user,
      createWritingSessionDto,
    );
  }

  // @Put(':/id')
  // @Roles(ROLE.USER)
  // updateWritingSession(
  //   @User() user: TUser,
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateWritingSessionDto: UpdateWritingSessionDto,
  // ) {
  //   return this.writingSessionService.updateWritingSession(
  //     id,
  //     user,
  //     updateWritingSessionDto,
  //   );
  // }
}
