export interface User {
  uuid: string;
  name: string;
}

export function userFrom(name: string, uuid: string): User {
  return {
    name: name,
    uuid: uuid,
  };
}
