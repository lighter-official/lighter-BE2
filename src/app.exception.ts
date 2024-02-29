import { HttpException, HttpStatus } from '@nestjs/common';

export enum ExceptionCode {
  InvalidParameters,
  BadRequest,
  ExpiredAccessToken,
  ExpiredRefreshToken,
  NoRefreshToken,
  InvalidToken,
  InsufficientParameters,
  NotFound,
  AlreadyUsedValue,
  Unauthorized,
}

export class Exception extends HttpException {
  constructor(
    code: ExceptionCode,
    message?: string,
    status: HttpStatus = HttpStatus.OK,
  ) {
    super({ code: ExceptionCode[code], message }, status);
  }
}
