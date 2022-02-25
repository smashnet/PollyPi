import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { Cookies } from './util/cookie.decorator';
import { v4 as uuidv4 } from 'uuid';
import { AddUserDto } from './add-user.dto';
import { NoUserGuard } from './util/nouser.guard';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  @UseGuards(NoUserGuard)
  index(@Cookies('name') name: string, @Cookies('uuid') uuid: string) {
    return {
      user: {
        name: name,
        uuid: uuid,
      },
    };
  }

  @Get('welcome')
  @Render('index')
  @UseGuards(NoUserGuard)
  welcome(@Cookies('name') name: string, @Cookies('uuid') uuid: string) {
    return {
      user: {
        name: name,
        uuid: uuid,
      },
    };
  }

  @Get('login')
  @Render('login')
  login() {
    return;
  }

  @Post('login')
  @Render('registered')
  placeCookies(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() addUserDto: AddUserDto,
  ) {
    const name = addUserDto.name;
    const uuid = uuidv4();
    response.cookie('name', name);
    response.cookie('uuid', uuid);
    this.logger.log(`New user: ${name} - ${uuid} (${request.ip})`);
    return {
      user: {
        name: name,
        uuid: uuid,
      },
    };
  }
}
