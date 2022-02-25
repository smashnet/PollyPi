/* eslint-disable prefer-const */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { NoUserException } from './nouser.exception';

@Injectable()
export class NoUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!isValid(request)) {
      throw new NoUserException(context);
    }
    return true;
  }
}

function isValid(req: Request): boolean {
  const name: string = req.cookies.name;
  const uuid: string = req.cookies.uuid;
  if (name && uuid) {
    if (name.length > 0 && uuid.length === 36) {
      return true;
    }
  }
  return false;
}
