import { SignInWithKakaoRequestDto } from 'src/context/account/users/users.dto';

export type SignInArgs = SignInWithKakaoRequestDto;

export type OAuthToken = {
  token_type: 'bearer';
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
};

export type KakaoMe = {
  id: number;
  connected_at: string;
  kakao_account: {
    profile: { nickname: string };
  };
};
