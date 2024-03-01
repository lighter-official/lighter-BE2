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
}
