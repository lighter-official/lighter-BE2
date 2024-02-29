import { Injectable } from '@nestjs/common';
import { Prisma, User, WritingSessionStatus } from '@prisma/client';
import {
  CreateWritingSessionDto,
  UpdateWritingSessionDto,
} from './writing-session.dto';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { Exception, ExceptionCode } from 'src/app.exception';

@Injectable()
export class WritingSessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createWritingSession(
    user: User,
    createWritingSessionDto: CreateWritingSessionDto,
  ) {
    const { page, period, startAt, subject, writingHours } =
      createWritingSessionDto;

    if (
      !page ||
      !period ||
      !startAt ||
      !startAt.hour ||
      (!startAt.hour && startAt.hour !== 0) ||
      (!startAt.minute && startAt.minute !== 0) ||
      !subject ||
      !writingHours
    )
      throw new Exception(ExceptionCode.InsufficientParameters);

    // const existingOnProcessWritingSession =
    //   await this.prismaService.writingSession.findFirst({
    //     where: {
    //       userId: user.id,
    //       status: WritingSessionStatus.onProcess,
    //       startAt: startAt as Prisma.JsonFilter<'WritingSession'>,
    //     },
    //   });

    const writingSession = await this.prismaService.writingSession.create({
      data: { page, period, startAt, subject, writingHours, userId: user.id },
    });

    return writingSession;
  }

  // async updateWritingSession(
  //   id: number,
  //   user: User,
  //   updateWritingSessionDto: UpdateWritingSessionDto,
  // ) {
  //   const { startAt, ...data } = updateWritingSessionDto;
  //   // start_time을 원하는 포맷으로 변환
  //   const startTimeFormatted = /* 변환 로직 */ '';

  //   const session = await this.prismaService.writingSession.findUnique({
  //     where: {
  //       id,
  //       userId: user.id,
  //     },
  //   });

  //   if (!existingSession) {
  //     await this.prismaService.writingSession.create({
  //       data: {
  //         ...data,
  //         userId,
  //         start_time: startTimeFormatted,
  //         change_num: 0,
  //       },
  //     });
  //     return { result: 'inserted' };
  //   } else {
  //     await this.prisma.writingSetting.update({
  //       where: { userId },
  //       data: {
  //         ...data,
  //         start_time: startTimeFormatted,
  //       },
  //     });
  //     return { result: 'updated' };
  //   }
  // }

  remove(id: number) {
    return `This action removes a #${id} writingSetting`;
  }
}
