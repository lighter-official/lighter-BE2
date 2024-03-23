import { Injectable } from '@nestjs/common';
import { BadgeCondition, User } from '@prisma/client';
import { Exception, ExceptionCode } from 'src/app.exception';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class UserBadgeService {
  constructor(private readonly prismaService: PrismaService) {}

  async acquireBadge(user: User, badgeCondition: BadgeCondition) {
    const userId = user.id;
    const badgeId = await this.prismaService.badge
      .findUnique({
        where: { condition: badgeCondition },
        select: { id: true },
      })
      .then((badge) => badge.id);

    const existingUserBadge = await this.prismaService.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existingUserBadge) return false;

    const userBadge = await this.prismaService.userBadge.create({
      data: { badgeId, userId },
      include: { badge: true },
    });

    return userBadge;
  }

  async acquireBadgeBySubmittingWriting(
    user: User,
    progressPercentage: number,
  ) {
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
        this.acquireBadge(user, badgeCondition),
      ),
    ).then((userBadges) => userBadges.filter(Boolean));

    return newBadges;
  }
}
