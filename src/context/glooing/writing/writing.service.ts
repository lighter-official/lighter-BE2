import { Injectable } from '@nestjs/common';
import {
  CreateWritingDto,
  SubmitWritingDto,
  TemporarySaveWritingDto,
  UpdateWritingDto,
} from './writing.dto';
import {
  BadgeCondition,
  User,
  WritingSession,
  WritingSessionStatus,
} from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { calculateProgressPercentage } from 'src/context/utils/calculateProgressPercentage';
import { Exception, ExceptionCode } from 'src/app.exception';
import { UserBadgeService } from 'src/context/reward/userBadge/userBadge.service';
import { WritingSessionService } from '../writing-session/writing-session.service';

@Injectable()
export class WritingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userBadgeService: UserBadgeService,
    private readonly writingSessionsService: WritingSessionService,
  ) {}

  async getWriting(user: User, writingId: number) {
    const writing = await this.prismaService.writing.findUnique({
      where: { id: writingId },
      include: { writingSession: true },
    });
    if (writing.writingSession.userId !== user.id)
      throw new Exception(ExceptionCode.Unauthorized, '권한이 없습니다.');

    return writing;
  }

  async startWriting(user: User, writingSessionId: number) {
    const writingSession = await this.prismaService.writingSession.findUnique({
      where: {
        id: writingSessionId,
        userId: user.id,
        status: WritingSessionStatus.onProcess,
      },
      include: { writings: true },
    });
    this.barrier_WritingSessionMustBeActivatedWhenCreatingWriting(
      writingSession,
    );

    let isNewWriting = false;
    let writing = writingSession.writings.find(
      (writing) => writing.step === writingSession.progressStep + 1,
    );
    if (!writing) {
      writing = await this.prismaService.writing.create({
        data: {
          step: writingSession.progressStep + 1,
          writingSession: { connect: { id: writingSessionId } },
        },
      });
      isNewWriting = true;
    }

    return { writing, isNewWriting };
  }

  async submitWriting(
    user: User,
    writingId: number,
    submitWritingDto: SubmitWritingDto,
  ) {
    const { title, content } = submitWritingDto;
    if (!title || !content) {
      throw new Exception(ExceptionCode.InsufficientParameters);
    }

    const { writingSession } = await this.prismaService.writing.findUnique({
      where: { id: writingId },
      select: {
        writingSession: {
          select: {
            id: true,
            progressStep: true,
            page: true,
            finishDate: true,
            nearestStartDate: true,
          },
        },
      },
    });
    const progressStep = Math.min(
      writingSession.progressStep + 1,
      writingSession.page,
    );
    const progressPercentage = calculateProgressPercentage(
      writingSession.page,
      progressStep,
    );

    // 글쓰기 제출, 달성률 업데이트
    const submittedWriting = await this.prismaService.writing.update({
      where: { id: writingId },
      data: {
        title,
        content,
        writingSession: {
          update: {
            progressStep,
            progressPercentage,
          },
        },
      },
    });

    // isActivated false로 업데이트
    await this.writingSessionsService.deactivateWritingSession(
      writingSession.id,
      false,
    );

    const newBadges =
      await this.userBadgeService.acquireBadgeBySubmittingWriting(
        user,
        progressPercentage,
      );

    if (
      writingSession.finishDate < writingSession.nearestStartDate &&
      writingSession.progressStep < 75
    )
      newBadges.push(
        await this.userBadgeService.acquireBadge(user, BadgeCondition.failed),
      );

    return { writing: submittedWriting, count: progressStep, newBadges };
  }

  async temporarySaveWriting(
    user: User,
    writingId: number,
    temporarySaveWritingDto: TemporarySaveWritingDto,
  ) {
    const { content, title } = temporarySaveWritingDto;
    await this.prismaService.writing.update({
      where: { id: writingId, writingSession: { userId: user.id } },
      data: { title, content },
    });
  }

  // TODO: 책임 분해 refactor, deprecated
  // async createWriting(user: User, createWritingDto: CreateWritingDto) {
  //   const { title, content } = createWritingDto;
  //   if (!title || !content) {
  //     throw new Exception(ExceptionCode.InsufficientParameters);
  //   }

  //   const writingSession = await this.prismaService.writingSession.findFirst({
  //     where: { userId: user.id, status: WritingSessionStatus.onProcess },
  //     include: { _count: { select: { writings: true } } },
  //   });
  //   this.barrier_WritingSessionMustBeActivatedWhenCreatingWriting(
  //     writingSession,
  //   );

  //   const writing = await this.prismaService.writing.create({
  //     data: { title, content, writingSessionId: writingSession.id },
  //   });

  //   // 달성율 업데이트
  //   const newCount = writingSession._count.writings + 1;
  //   const progressPercentage = calculateProgressPercentage(
  //     writingSession.page,
  //     newCount,
  //   );
  //   await this.prismaService.writingSession.update({
  //     where: { id: writingSession.id },
  //     data: { progressPercentage, isActivated: false },
  //   });

  //   // 뱃지 지급
  //   const newBadges =
  //     await this.userBadgeService.acquireBadgeBySubmittingWriting(
  //       user,
  //       progressPercentage,
  //     );

  //   return { writing, count: newCount, newBadges };
  // }

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
