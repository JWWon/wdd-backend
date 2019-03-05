export const isEmailVaild = (value: string) => {
  const regex = new RegExp(
    // tslint:disable-next-line:max-line-length
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  );
  return regex.test(value.toLowerCase());
};
