import { Injectable } from '@nestjs/common';
import { CreateWritingDto, UpdateWritingDto } from './writing.dto';
import { User, WritingSession, WritingSessionStatus } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { calculateProgressPercentage } from 'src/context/utils/calculateProgressPercentage';
import { day } from 'src/lib/dayjs';
import { WritingSessionStartAt } from '../writing-session/writing-session.type';
import { Exception, ExceptionCode } from 'src/app.exception';

@Injectable()
export class WritingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getWriting(user: User, writingId: number) {
    const writing = await this.prismaService.writing.findUnique({
      where: { id: writingId },
      include: { writingSession: true },
    });
    if (writing.writingSession.userId !== user.id)
      throw new Exception(ExceptionCode.Unauthorized, '권한이 없습니다.');

    return writing;
  }

  async createWriting(user: User, createWritingDto: CreateWritingDto) {
    const { title, content } = createWritingDto;
    if (!title || !content) {
      throw new Exception(ExceptionCode.InsufficientParameters);
    }

    const writingSession = await this.prismaService.writingSession.findFirst({
      where: { userId: user.id, status: WritingSessionStatus.onProcess },
      include: { _count: true },
    });
    this.barrier_WritingSessionMustBeActivatedWhenCreatingWriting(
      writingSession,
    );

    const writing = await this.prismaService.writing.create({
      data: { title, content },
    });

    //TODO: 이벤트 추가

    return { writing, count: writingSession._count };
  }

  async updateWriting(
    user: User,
    writingId: number,
    updateWritingDto: UpdateWritingDto,
  ) {
    const { title, content } = updateWritingDto;
    if (!title || !content) {
      throw new Exception(ExceptionCode.InsufficientParameters);
    }

    const writing = await this.prismaService.writing.findUnique({
      where: { id: writingId },
      include: { writingSession: true },
    });
    if (writing.writingSession.status !== WritingSessionStatus.onProcess)
      throw new Exception(
        ExceptionCode.BadRequest,
        '수정 가능 상태가 아닙니다.',
      );
    if (writing.writingSession.userId !== user.id)
      throw new Exception(ExceptionCode.Unauthorized, '권한이 없습니다.');

    const updatedWriting = await this.prismaService.writing.update({
      where: { id: writingId },
      data: { title, content },
    });

    return updatedWriting;
  }

  barrier_WritingSessionMustBeActivatedWhenCreatingWriting(
    writingSession: WritingSession,
  ) {
    if (!writingSession.isActivated)
      throw new Exception(ExceptionCode.BadRequest, '글쓰기 시간이 아닙니다.');
  }
}
