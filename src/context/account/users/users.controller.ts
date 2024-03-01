import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  SignInWithKakaoRequestDto,
  TestSignInDto,
  TestSignUpDto,
} from './users.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ROLE } from '../account.constant';
import { User as TUser } from '@prisma/client';
import { User } from 'src/decorators/user.decorator';

@Controller('/account/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up/test') testSignUp(@Body() testSignUpDto: TestSignUpDto) {
    return this.usersService.testSignUp(testSignUpDto);
  }

  @Post('sign-in/test') testSignIn(@Body() testSignInDto: TestSignInDto) {
    return this.usersService.testSignIn(testSignInDto);
  }

  @Post('sign-in/kakao')
  async signInWithKakao(
    @Body('code') code: string,
    @Body('redirectUri') redirectUri: string,
  ) {
    const signInWithKakaoRequestDto: SignInWithKakaoRequestDto = {
      code,
      redirectUri,
    };
    const { accessToken, refreshToken, isSignUp } =
      await this.usersService.signInWithKakao(signInWithKakaoRequestDto);

    return { accessToken, refreshToken, isSignUp };
  }

  @Get('refresh-token')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    if (!refreshToken) return;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.usersService.refreshToken(refreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  @Get('me')
  @Roles(ROLE.USER)
  getMe(@User() user: TUser) {
    return this.usersService.getMe(user);
  }
}
