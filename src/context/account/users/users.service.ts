import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { ProviderType, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { JwtPayload, sign } from 'jsonwebtoken';
import { ROLE, TOKEN_TYPE } from '../account.constant';
import { Exception, ExceptionCode } from 'src/app.exception';
import {
  SignInWithKakaoRequestDto,
  TestSignInDto,
  TestSignUpDto,
} from './users.dto';
import { KakaoService } from 'src/service/kakao/kakao.service';
import { compare, hash } from 'bcrypt';
const { TEST_KEY, ADMIN_IDS } = process.env;

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private kakaoService: KakaoService,
  ) {}

  // async testSignUp(testSignUpDto: TestSignUpDto) {
  //   const { id, password, testKey } = testSignUpDto;

  //   if (!id || !password || !testKey)
  //     throw new Exception(ExceptionCode.InsufficientParameters);
  //   if (testKey !== TEST_KEY) throw new Exception(ExceptionCode.Unauthorized);

  //   const existingUser = await this.prismaService.user.findUnique({
  //     where: { id, providerType: ProviderType.test },
  //     select: { id: true },
  //   });
  //   if (existingUser)
  //     throw new Exception(
  //       ExceptionCode.AlreadyUsedValue,
  //       '이미 사용중인 id입니다.',
  //     );

  //   const encryptedPassword = await this.encryptPassword(password);
  //   const user = await this.prismaService.user.create({
  //     data: {
  //       id,
  //       providerType: 'test',
  //       encryptedPassword,
  //     },
  //     select: { id: true },
  //   });

  //   const accessToken = await this.createAccessToken(user);
  //   const refreshToken = await this.createRefreshToken(user);

  //   return { accessToken, refreshToken };
  // }

  // async encryptPassword(password: string): Promise<string> {
  //   const encryptedPassword = hash(password, 10);

  //   return encryptedPassword;
  // }

  async stopSignInWhenNoTestUserExist(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user)
      throw new Exception(ExceptionCode.NotFound, 'DB에 해당 정보가 없습니다.');

    return;
  }

  // async stopSignInWhenPasswordIsIncorrect(id: string, password: string) {
  //   const isVerified = await this.verifyPassword(id, password);
  //   if (!isVerified) throw new Exception(ExceptionCode.BadRequest);

  //   return;
  // }

  // async verifyPassword(id: string, password: string): Promise<boolean> {
  //   const { encryptedPassword } = await this.prismaService.user.findUnique({
  //     where: { id },
  //     select: { encryptedPassword: true },
  //   });
  //   if (!encryptedPassword)
  //     throw new Exception(ExceptionCode.NotFound, 'DB에 해당 정보가 없습니다.');

  //   return compare(password, encryptedPassword);
  // }

  // async testSignIn(testSignInDto: TestSignInDto) {
  //   const { id, password, testKey } = testSignInDto;

  //   if (!id || !password || !testKey)
  //     throw new Exception(ExceptionCode.InsufficientParameters);
  //   if (testKey !== TEST_KEY) throw new Exception(ExceptionCode.Unauthorized);

  //   await this.stopSignInWhenNoTestUserExist(id);
  //   await this.stopSignInWhenPasswordIsIncorrect(id, password);

  //   const user = await this.prismaService.user.findUnique({
  //     where: { id },
  //   });
  //   if (!user)
  //     throw new Exception(ExceptionCode.NotFound, 'DB에 해당 정보가 없습니다.');

  //   const hasOnProcessedWritingSession =
  //     await this.getHasOnProcessedWritingSession(user);

  //   const accessToken = await this.createAccessToken(user);
  //   const refreshToken = await this.createRefreshToken(user);

  //   return { accessToken, refreshToken, hasOnProcessedWritingSession };
  // }

  async refreshToken(refreshToken: string) {
    try {
      if (!refreshToken) throw new Error();

      const id = jwt.verify(refreshToken, process.env.JWT_SECRET).sub as string;

      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error('존재하지 않는 고객 id를 담고 있는 토큰입니다.');
      }

      const newAccessToken = await this.createAccessToken({
        id,
      });
      const newRefreshToken = await this.createRefreshToken({
        id,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (e) {
      const errorName = (e as Error).name;

      switch (errorName) {
        case 'TokenExpiredError':
          throw new Exception(ExceptionCode.ExpiredRefreshToken);
        default:
          throw e;
      }
    }
  }

  async createAccessToken(user: Pick<User, 'id'>): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      role: ROLE.USER,
      type: TOKEN_TYPE.ACCESS_TOKEN,
    };
    const secret = process.env.JWT_SECRET;
    const expiresIn = '2d';

    if (!secret) throw new Exception(ExceptionCode.NotFound);

    const accessToken: string = sign(payload, secret, { expiresIn });

    return accessToken;
  }

  async createRefreshToken(user: Pick<User, 'id'>): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      role: ROLE.USER,
      type: TOKEN_TYPE.REFRESH_TOKEN,
    };
    const secret = process.env.JWT_SECRET;
    const expiresIn = '2d';

    if (!secret) throw new Exception(ExceptionCode.NotFound);

    const refreshToken: string = sign(payload, secret, { expiresIn });

    return refreshToken;
  }

  async signInWithKakao(signInWithKakaoRequestDto: SignInWithKakaoRequestDto) {
    const { code, redirectUri } = signInWithKakaoRequestDto;
    if (!code || !redirectUri) throw new Error('Bad Request');

    const { kakaoId, ...me } = await this.kakaoService.signIn(
      signInWithKakaoRequestDto,
    );

    let user = await this.prismaService.user.findUnique({
      where: { id: kakaoId },
    });

    let isSignUp = false;
    if (!user) {
      user = await this.createUserFromKakao(kakaoId);
      isSignUp = true;
    }
    await this.prismaService.user.update({
      where: { id: kakaoId, providerType: 'kakao' },
      data: { nickname: me.kakao_account.profile.nickname },
    });
    const hasOnProcessedWritingSession =
      await this.getHasOnProcessedWritingSession(user);

    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      isSignUp,
      hasOnProcessedWritingSession,
    };
  }

  async createUserFromKakao(kakaoId: string) {
    const user = await this.prismaService.user.create({
      data: {
        id: kakaoId,
        providerType: ProviderType.kakao,
      },
    });

    return user;
  }

  async getMe(user: User) {
    const me = await this.prismaService.user.findUnique({
      where: { id: user.id },
      include: {
        userBadges: { include: { badge: true } },
        writingSessions: {
          orderBy: { finishDate: 'desc' },
          include: { writings: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });

    return me;
  }

  async deleteUser(user: User) {
    const adminIds = ADMIN_IDS.split(',');
    if (!adminIds.includes(user.id)) return;

    const deletedUser = await this.prismaService.user.delete({
      where: { id: user.id },
    });

    if (user.providerType === 'kakao') {
      await this.kakaoService.unlink(user.id);
    }
    await this.prismaService.cronTask.deleteMany({
      where: { name: { startsWith: `${user.id}/` } },
    });

    return deletedUser;
  }

  async getHasOnProcessedWritingSession(user: User) {
    const writingSession = await this.prismaService.writingSession.findFirst({
      where: { userId: user.id, status: 'onProcess' },
    });

    return !!writingSession;
  }
}
