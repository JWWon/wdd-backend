import { Position } from '../@types/local';

interface Payment {
  card: string;
  provider: string;
  default: boolean;
}

export const isEmailVaild = (value: string) => {
  const regex = new RegExp(
    // tslint:disable-next-line:max-line-length
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  );
  return regex.test(value.toLowerCase());
};

export const hasProperties = <T>(object: T, keys: string[]) => {
  keys.forEach((key: string) => {
    if (!(key in object)) return false;
  });
  return true;
};
