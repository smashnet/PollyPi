import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class NoUserException extends HttpException {
  constructor(context: ExecutionContext) {
    super('NoUser', HttpStatus.TEMPORARY_REDIRECT);
    const response = context.switchToHttp().getResponse<Response>();
    response.setHeader('Location', '/login');
  }
}
