import { hostname } from 'os';
import { env } from 'process';

export const config = {
  base_url: env.BASE_URL ? env.BASE_URL : `http://${hostname}:3000`,
};
