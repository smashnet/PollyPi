import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
  Logger,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { UpdatePollDto } from './dto/update-poll.dto';
import { v4 as uuidv4 } from 'uuid';
import { AddQuestionDto } from './dto/add-question.dto';

@Controller('poll')
export class PollController {
  private readonly logger = new Logger(PollController.name);
  constructor(private readonly pollService: PollService) {}

  @Post('create')
  @Render('create_poll')
  create() {
    const createPollDto = {
      owner: {
        uuid: uuidv4(),
        name: 'Nico',
      },
    };
    const newPollCode = this.pollService.create(createPollDto);
    return { poll: { code: newPollCode }, selectedQuestion: 1 };
  }

  @Post(':code/question/:questionNumber')
  @Render('create_poll')
  addQuestion(
    @Body() addQuestionDto: AddQuestionDto,
    @Param('code') code: string,
    @Param('questionNumber') qNo: string,
  ) {
    this.logger.log(`New question arrived: ${JSON.stringify(addQuestionDto)}`);
    const poll = this.pollService.addQuestion(code, qNo, addQuestionDto);
    this.logger.log(
      `Added question to poll ${code}: ${JSON.stringify(
        poll.questions.get(qNo),
      )}`,
    );
    console.log(addQuestionDto);
    if (addQuestionDto.editQuestion) {
      console.log(poll);
      return { poll: poll, selectedQuestion: qNo };
    } else {
      return { poll: poll, selectedQuestion: String(poll.questions.size + 1) };
    }
  }

  @Get(':code/question/:number')
  @Render('create_poll')
  showQuestion(@Param('code') code: string, @Param('number') num: string) {
    return {
      poll: this.pollService.findOne(code),
      selectedQuestion: num,
    };
  }

  @Get(':code/question/:number/edit')
  @Render('create_poll')
  editQuestion(@Param('code') code: string, @Param('number') num: string) {
    return {
      poll: this.pollService.findOne(code),
      selectedQuestion: num,
      editQuestion: true,
    };
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.pollService.findOne(code);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() updatePollDto: UpdatePollDto) {
    return this.pollService.update(code, updatePollDto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.pollService.remove(code);
  }
}
