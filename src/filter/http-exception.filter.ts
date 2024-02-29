import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const error = exception.getResponse();
    const code =
      typeof error === 'string' ? error : (error as { code: string }).code;
    const message = exception.message;

    response.status(status).json({
      success: false,
      code,
      data: null,
      message,
    });
  }
}
