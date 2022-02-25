import { User } from 'src/domain/user.interface';
import { v4 as uuidv4 } from 'uuid';

export function getRandomCode(): string {
  return uuidv4().substring(0, 8);
}

export function listContainsUser(list: User[], user: User): boolean {
  return (
    list.find((existingUser) => usersAreEqual(existingUser, user)) !== undefined
  );
}

export function letterFromIndex(i: number): string {
  return String.fromCharCode(i + 65);
}

export function indexFromLetter(l: string): number {
  return l.charCodeAt(0) - 65;
}

export function usersAreEqual(user1: User, user2: User): boolean {
  return user1.name === user2.name && user1.uuid === user2.uuid;
}
