import { Question } from './question.interface';
import { User } from './user.interface';

export interface Poll {
  code: string;
  owner: User;
  participants: string[];
  published: boolean;
  finished: boolean;
  questions: Question[];
}