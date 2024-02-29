export class SignInWithKakaoRequestDto {
  code: string;
  redirectUri: string;
}

export type TestSignUpDto = {
  id: string;
  password: string;
  testKey: string;
};

export type TestSignInDto = TestSignUpDto;
