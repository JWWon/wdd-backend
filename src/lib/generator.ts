export const genDigits = (length: number) => {
  const list: string[] = [];
  for (let i = 0; i < length; i += 1) {
    list.push(Math.floor(Math.random() * 10).toString());
  }
  return list.join('');
};
