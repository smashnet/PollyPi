import { Answer } from './answer.interface';

export interface Question {
  question: string;
  answerOptions: Answer[];
}
