import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Exception, ExceptionCode } from 'src/app.exception';
import { ROLE, TOKEN_TYPE } from 'src/context/account/account.constant';

import { PrismaService } from 'src/db/prisma/prisma.service';

const JWT_SECRET = process.env.JWT_SECRET;

@Injectable()
export class InjectAccountMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    if (req.baseUrl.includes('refresh-token')) return next();
    if (req.baseUrl.includes('delete')) return next();

    const accessToken = req.headers.authorization?.split('Bearer ')[1];
    if (!accessToken || accessToken === null || accessToken === 'null')
      return next();

    const { role, type } = jwt.decode(accessToken) as {
      role: ROLE;
      type: TOKEN_TYPE;
    };

    if (type !== TOKEN_TYPE.ACCESS_TOKEN)
      throw new Exception(
        ExceptionCode.InvalidToken,
        undefined,
        HttpStatus.BAD_REQUEST,
      );
    if (role !== ROLE.USER)
      throw new Exception(
        ExceptionCode.InvalidToken,
        undefined,
        HttpStatus.BAD_REQUEST,
      );

    try {
      const { sub } = jwt.verify(accessToken, JWT_SECRET);
      const args: Prisma.UserFindUniqueArgs = {
        where: { id: sub as string },
      };
      const user = await this.prismaService.user.findUnique(args);

      req.user = user;

      next();
    } catch (e) {
      const errorName = (e as Error).name;
      switch (errorName) {
        case 'TokenExpiredError':
          throw new Exception(ExceptionCode.ExpiredAccessToken);
        default:
          throw new Exception(
            ExceptionCode.InvalidToken,
            undefined,
            HttpStatus.BAD_REQUEST,
          );
      }
    }
  }
}
