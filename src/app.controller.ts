import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { Cookies } from './util/cookie.decorator';
import { v4 as uuidv4 } from 'uuid';
import { AddUserDto } from './add-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect('welcome', 302)
  checkCookie(@Cookies('name') name: string, @Cookies('uuid') uuid: string) {
    if (name === undefined || uuid === undefined) {
      // if cookies are not set, redirect to login view.
      return { url: '/login' };
    }
    console.log('check', name, uuid);
    return;
  }

  @Get('welcome')
  @Render('index')
  welcome(@Cookies('name') name: string, @Cookies('uuid') uuid: string) {
    return { username: name };
  }

  @Get('login')
  @Render('login')
  login() {
    return;
  }

  @Post('login')
  @Redirect('/', 302)
  placeCookies(
    @Res({ passthrough: true }) response: Response,
    @Body() addUserDto: AddUserDto,
  ) {
    console.log('Registering:', addUserDto.name);
    response.cookie('name', addUserDto.name);
    response.cookie('uuid', uuidv4());
    return { url: '/' };
  }
}
