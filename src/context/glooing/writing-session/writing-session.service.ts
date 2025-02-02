import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BadgeCondition,
  User,
  WritingSession,
  WritingSessionStatus,
} from '@prisma/client';
import {
  CreateWritingSessionDto,
  UpdateWritingSessionDto,
} from './writing-session.dto';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { Exception, ExceptionCode } from 'src/app.exception';
import { day } from 'src/lib/dayjs';
import { WritingSessionStartAt } from './writing-session.type';
import * as cron from 'node-cron';
import { makeCronExpression } from 'src/context/utils/makeCronExpreesion';
import { UserBadgeService } from 'src/context/reward/userBadge/userBadge.service';
@Injectable()
export class WritingSessionService implements OnModuleInit {
  private cronTasks = {};
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userBadgeService: UserBadgeService,
  ) {}
  onModuleInit() {
    this.refreshCronTasks();
  }

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

    if (
      !page ||
      !period ||
      !startAt ||
      (!startAt.hour && startAt.hour !== 0) ||
      (!startAt.minute && startAt.minute !== 0) ||
      !subject ||
      !writingHours
    )
      throw new Exception(ExceptionCode.InsufficientParameters);

    const _startDate = this.getStartDate(startAt);
    const startDate = _startDate.toDate();
    const nearestFinishDate = _startDate.add(writingHours, 'hour');
    const _finishDate = nearestFinishDate.add(period, 'day');
    const finishDate = _finishDate.toDate();

    const writingSession = await this.prismaService.writingSession.create({
      data: {
        page,
        period,
        startAt,
        subject,
        writingHours,
        userId: user.id,
        startDate,
        nearestStartDate: startDate,
        finishDate,
        nearestFinishDate: nearestFinishDate.toDate(),
      },
    });

    this.registerWritingSessionCronJobs(writingSession);

    return writingSession;
  }

  async updateWritingSession(
    id: number,
    user: User,
    updateWritingSessionDto: UpdateWritingSessionDto,
    forContinue: boolean,
  ) {
    const { page, period, startAt, subject, writingHours } =
      updateWritingSessionDto;
    const prevWritingSession =
      await this.prismaService.writingSession.findUnique({ where: { id } });
    if (!forContinue && prevWritingSession.modifyingCount >= 1)
      throw new Exception(
        ExceptionCode.BadRequest,
        '수정 횟수를 모두 소진하였습니다.',
      );

    if (
      !page ||
      !period ||
      !startAt ||
      (!startAt.hour && startAt.hour !== 0) ||
      (!startAt.minute && startAt.minute !== 0) ||
      !subject ||
      !writingHours
    )
      throw new Exception(ExceptionCode.InsufficientParameters);

    const _startDate = this.getStartDate(
      startAt,
      forContinue ? undefined : prevWritingSession.startDate,
    );
    const startDate = _startDate.toDate();
    const nearestStartDate = day()
      .add(1, 'day')
      .set('hour', startAt.hour)
      .set('minute', startAt.minute)
      .set('second', 0)
      .toDate();
    const nearestFinishDate = day(nearestStartDate).add(writingHours, 'hour');

    const _finishDate = _startDate.add(writingHours, 'hour').add(period, 'day');
    const finishDate = _finishDate.toDate();

    const writingSession = await this.prismaService.writingSession.update({
      where: { id },
      data: {
        page,
        period,
        startAt,
        subject,
        writingHours,
        userId: user.id,
        startDate,
        nearestStartDate,
        finishDate,
        nearestFinishDate: nearestFinishDate.toDate(),
        status: 'onProcess',
        modifyingCount: forContinue ? 0 : { increment: 1 },
        isActivated: false,
        continuedCount: forContinue
          ? { increment: 1 }
          : prevWritingSession.continuedCount,
      },
    });

    // 크론 재등록
    const cronTasks = await this.prismaService.cronTask.findMany({
      where: { name: { startsWith: `${user.id}/${id}` } },
    });

    for (const { id, name } of cronTasks) {
      await this.prismaService.cronTask.delete({
        where: { id },
      });
      this.removeCronJob(name);
    }

    this.registerWritingSessionCronJobs(writingSession);

    return writingSession;
  }

  async getOnProcessWritingSession(user: User) {
    const writingSession = await this.prismaService.writingSession.findFirst({
      where: { userId: user.id, status: WritingSessionStatus.onProcess },
      include: {
        writings: {
          select: { id: true, title: true, content: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return writingSession;
  }

  getStartDate(startAt: WritingSessionStartAt, prevStartDate?: Date) {
    const { hour, minute } = startAt;
    let startDate = (prevStartDate ? day(prevStartDate) : day())
      .set('hour', hour)
      .set('minute', minute)
      .set('second', 0);

    const now = day();
    if (now.isAfter(startDate)) {
      startDate = startDate.add(1, 'day');
    }

    return startDate;
  }

  private async activateWritingSession(id: number) {
    const nearestStartDate = day()
      .add(1, 'day')
      .set('second', 0)
      .set('millisecond', 0)
      .toDate();
    try {
      const writingSession = await this.prismaService.writingSession.update({
        where: { id },
        data: { isActivated: true, nearestStartDate },
      });

      return writingSession.isActivated;
    } catch (e) {
      console.log(e);
    }
  }

  async deactivateWritingSession(id: number, byCron: boolean) {
    const nearestFinishDate = day()
      .add(1, 'day')
      .set('second', 0)
      .set('millisecond', 0)
      .toDate();
    try {
      const writingSession = await this.prismaService.writingSession.update({
        where: { id },
        data: { isActivated: false, nearestFinishDate },
      });

      const { finishDate, nearestStartDate } = writingSession;

      // writingSession종료
      if (day(nearestStartDate).isAfter(finishDate)) {
        await this.updateWritingSessionStatusToCompleteFromOnProcess(
          id,
          byCron,
        );
      }

      return writingSession.isActivated;
    } catch (e) {
      console.log(e);
    }
  }

  async updateWritingSessionStatusToCompleteFromOnProcess(
    id: number,
    byCron: boolean,
  ) {
    const { userId, progressPercentage } =
      await this.prismaService.writingSession.findUnique({
        where: { id },
        select: { progressPercentage: true, userId: true },
      });

    const updatedWritingSession =
      await this.prismaService.writingSession.update({
        where: { id },
        data: {
          status:
            progressPercentage >= 75
              ? WritingSessionStatus.completed
              : WritingSessionStatus.aborted,
        },
        include: { user: true },
      });
    const cronTasks = await this.prismaService.cronTask.findMany({
      where: { name: { startsWith: `${userId}/` } },
    });

    for (const { id, name } of cronTasks) {
      await this.prismaService.cronTask.delete({
        where: { id },
      });
      this.removeCronJob(name);
    }

    if (progressPercentage < 75 && byCron)
      await this.userBadgeService.acquireBadge(
        updatedWritingSession.user,
        BadgeCondition.failed,
      );

    return updatedWritingSession;
  }

  async registerWritingSessionCronJobs(writingSession: WritingSession) {
    const activateCronName = `${writingSession.userId}/${writingSession.id}/activate`;
    const activateCronExpression = makeCronExpression(writingSession.startDate);
    const deactivateCronName = `${writingSession.userId}/${writingSession.id}/deactivate`;
    const deactivateCronExpression = makeCronExpression(
      writingSession.finishDate,
    );

    this.addCronJob(activateCronName, activateCronExpression, () => {
      this.activateWritingSession(writingSession.id);
    });
    this.addCronJob(deactivateCronName, deactivateCronExpression, () => {
      this.deactivateWritingSession(writingSession.id, true);
    });

    const cronJobs = await this.prismaService.cronTask.createMany({
      data: [
        {
          name: activateCronName,
          expression: activateCronExpression,
          type: 'activate',
        },
        {
          name: deactivateCronName,
          expression: deactivateCronExpression,
          type: 'deactivate',
        },
      ],
    });

    return cronJobs;
  }

  async getCronTasks() {
    const cronTasks = cron.getTasks();
    const keys = [];
    for (const [key, value] of cronTasks.entries()) {
      keys.push(key);
    }

    return keys;
  }

  /**
   * 앱 재시작시 cronTasks 등록
   */
  async refreshCronTasks() {
    const cronTasks = await this.prismaService.cronTask.findMany();
    console.log(`${cronTasks.length}개 cronJob 다시 등록`);
    const cronTasksMap = cron.getTasks();
    cronTasks.forEach(({ name, type, expression }) => {
      const writingSessionId = Number(name.split('/')[1]);

      switch (type) {
        case 'activate':
          this.addCronJob(name, expression, () => {
            this.activateWritingSession(writingSessionId);
          });
          break;

        case 'deactivate':
          this.addCronJob(name, expression, () => {
            this.deactivateWritingSession(writingSessionId, true);
          });
          break;
      }
      this.cronTasks[name] = cronTasksMap.get(name);
    });
  }

  async publishWritingSession(
    user: User,
    writingSessionId: number,
    coverImageType: number,
  ) {
    const writingSession = await this.prismaService.writingSession.findUnique({
      where: { id: writingSessionId },
    });

    if (writingSession.userId !== user.id)
      throw new Exception(ExceptionCode.Unauthorized);

    if (writingSession.status !== WritingSessionStatus.completed)
      throw new Exception(
        ExceptionCode.BadRequest,
        '전자책을 발행할 수 없는 상태입니다.',
      );

    const publishedWritingSession =
      await this.prismaService.writingSession.update({
        where: { id: writingSessionId },
        data: { coverImageType, status: WritingSessionStatus.published },
      });

    return publishedWritingSession;
  }

  // TODO: cronJob 관련 메서드들 분리 할 것
  addCronJob(
    name: string,
    cronExpression: string,
    taskFunction: string | ((now: Date | 'manual' | 'init') => void),
  ) {
    if (this.cronTasks[name]) return;
    const task = cron.schedule(cronExpression, taskFunction, { name });
    this.cronTasks[name] = task;
  }

  removeCronJob(name: string) {
    this.cronTasks[name]?.stop();
    delete this.cronTasks[name];
  }

  upsertCronJob(
    name: string,
    cronExpression: string,
    taskFunction: string | ((now: Date | 'manual' | 'init') => void),
  ) {
    if (this.cronTasks[name]) {
      this.removeCronJob(name);
    }

    this.addCronJob(name, cronExpression, taskFunction);
  }
}
