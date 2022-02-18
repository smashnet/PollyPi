import { Question } from './question.interface';
import { User } from './user.interface';

export interface Poll {
  code: string;
  owner: User;
  participants: string[];
  open: boolean;
  questions: Map<string, Question>;
  dateCreated: string;
}
