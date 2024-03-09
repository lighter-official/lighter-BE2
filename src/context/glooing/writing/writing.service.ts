import { Injectable } from '@nestjs/common';
import { CreateWritingDto, UpdateWritingDto } from './writing.dto';
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

@Injectable()
export class WritingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userBadgeService: UserBadgeService,
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

  async createWriting(user: User, createWritingDto: CreateWritingDto) {
    const { title, content } = createWritingDto;
    if (!title || !content) {
      throw new Exception(ExceptionCode.InsufficientParameters);
    }

    const writingSession = await this.prismaService.writingSession.findFirst({
      where: { userId: user.id, status: WritingSessionStatus.onProcess },
      include: { _count: { select: { writings: true } } },
    });
    this.barrier_WritingSessionMustBeActivatedWhenCreatingWriting(
      writingSession,
    );

    const writing = await this.prismaService.writing.create({
      data: { title, content, writingSessionId: writingSession.id },
    });

    // 달성율 업데이트
    const newCount = writingSession._count.writings + 1;
    const progressPercentage = calculateProgressPercentage(
      writingSession.page,
      newCount,
    );
    await this.prismaService.writingSession.update({
      where: { id: writingSession.id },
      data: { progressPercentage },
    });

    // 뱃지 지급
    // TODO: eventEmitter 활용
    const badgeConditions: BadgeCondition[] = [
      BadgeCondition.firstWritingUploaded,
    ];
    if (progressPercentage >= 25)
      badgeConditions.push(BadgeCondition.partialCompleted25);
    if (progressPercentage >= 50)
      badgeConditions.push(BadgeCondition.partialCompleted50);
    if (progressPercentage >= 75)
      badgeConditions.push(BadgeCondition.partialCompleted75);
    if (progressPercentage === 100)
      badgeConditions.push(BadgeCondition.completed);

    const newBadges = await Promise.all(
      badgeConditions.map((badgeCondition) =>
        this.userBadgeService.acquireBadge(user, badgeCondition),
      ),
    ).then((userBadges) => userBadges.filter(Boolean));

    return { writing, count: newCount, newBadges };
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
