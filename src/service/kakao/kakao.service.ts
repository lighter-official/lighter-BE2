import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as QueryString from 'qs';
import * as jwt from 'jsonwebtoken';
import { SignInArgs } from './kakao.types';
import { GetMeData, GetTokensData } from './kakao.response';

const NODE_ENV = process.env.NODE_ENV;

@Injectable()
export class KakaoService {
  private readonly kauth: AxiosInstance;
  private readonly kapi: AxiosInstance;
  private readonly REST_API_KEY = process.env.KAKAO_REST_API_KEY;
  private readonly ADMIN_KEY = process.env.KAKAO_ADMIN_KEY;
  private readonly CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

  constructor() {
    const headers = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    this.kauth = axios.create({ baseURL: 'https://kauth.kakao.com', headers });
    this.kapi = axios.create({ baseURL: 'https://kapi.kakao.com', headers });
  }

  async signIn(signInArgs: SignInArgs) {
    const { code, redirectUri } = signInArgs;
    if (!code || !redirectUri) throw new Error('InsufficientParameters');

    const tokens = await this.getTokens(code, redirectUri);
    const kakaoId = jwt.decode(tokens.id_token).sub as string;
    const me = await this.getMe(kakaoId);

    return { kakaoId, ...me };
  }

  async getTokens(code: string, redirectUri: string): Promise<GetTokensData> {
    const url = '/oauth/token';
    const data = QueryString.stringify({
      grant_type: 'authorization_code',
      client_id: this.REST_API_KEY,
      client_secret: this.CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    });

    const response = await this.kauth.post<GetTokensData>(url, data);
    return response.data;
  }

  async unlink(kakaoId: string) {
    const url = '/v1/user/unlink';
    const data = QueryString.stringify({
      target_id_type: 'user_id',
      target_id: kakaoId,
    });
    const headers = { Authorization: `KakaoAK ${this.ADMIN_KEY}` };

    await this.kapi.post(url, data, { headers });

    return kakaoId;
  }

  async getMe(kakaoId: string) {
    const url = '/v2/user/me';
    const data = QueryString.stringify({
      target_id_type: 'user_id',
      target_id: kakaoId,
    });
    const headers = { Authorization: `KakaoAK ${this.ADMIN_KEY}` };
    const response = await this.kapi.post<GetMeData>(url, data, { headers });
    const me = response.data;

    return me;
  }
}
