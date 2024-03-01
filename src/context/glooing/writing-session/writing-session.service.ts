import { Injectable } from '@nestjs/common';
import { Prisma, User, WritingSessionStatus } from '@prisma/client';
import {
  CreateWritingSessionDto,
  UpdateWritingSessionDto,
} from './writing-session.dto';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { Exception, ExceptionCode } from 'src/app.exception';
import { day } from 'src/lib/dayjs';
import { Dayjs } from 'dayjs';

@Injectable()
export class WritingSessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createWritingSession(
    user: User,
    createWritingSessionDto: CreateWritingSessionDto,
  ) {
    const { page, period, startAt, subject, writingHours } =
      createWritingSessionDto;

    const existingOnProcessWritingSession =
      await this.prismaService.writingSession.findFirst({
        where: { userId: user.id, status: WritingSessionStatus.onProcess },
      });
    if (existingOnProcessWritingSession)
      throw new Exception(
        ExceptionCode.BadRequest,
        '진행 중인 글쓰기가 있습니다.',
      );

    const now = day();
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

    const finishedAt = this.calculateFinishedAt(
      now,
      period,
      startAt.hour,
      startAt.minute,
      writingHours,
    );

    const writingSession = await this.prismaService.writingSession.create({
      data: {
        page,
        period,
        startAt,
        subject,
        writingHours,
        userId: user.id,
        finishedAt,
      },
    });

    return writingSession;
  }

  calculateFinishedAt(
    now: Dayjs,
    period: number,
    hour: number,
    minute: number,
    writingHours: number,
  ) {
    const finishedAt = now
      .add(period - 1, 'day')
      .startOf('day')
      .add(hour + writingHours, 'hour')
      .add(minute, 'minute')
      .toDate();

    return finishedAt;
  }

  remove(id: number) {
    return `This action removes a #${id} writingSetting`;
  }

  async getOnProcessWritingSession(user: User) {
    const writingSession = await this.prismaService.writingSession.findFirst({
      where: { userId: user.id, status: WritingSessionStatus.onProcess },
      include: {
        writings: {
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return writingSession;
  }
}
