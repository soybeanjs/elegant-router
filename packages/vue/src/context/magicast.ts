import path from 'path';
import { generateCode, parseModule, loadFile } from 'magicast';

interface Person {
  name: string;
  age: number;
  gender?: 'male' | 'female';
  component?: (() => Promise<any>) | string;
}

export function start() {
  // const person: Person = {
  //   name: 'soybean',
  //   age: 18
  // };

  const code1 = `
interface Person {
  name: string;
  age: number;
  gender?: "male" | "female";
  component?: () => Promise<any>
}

export const person: Person = {
  name: 'soybean',
  age: 18
};

`;

  const mod = parseModule<{ person: Person }>(code1, { parser: require('recast/parsers/typescript') });

  mod.exports.person.component = '() => Promise.resolve(1)';
  console.log('mod.exports.person: ', mod.exports);

  const { code } = generateCode(mod);
  console.log('code: ', code);
}

async function start2() {
  const mod = await loadFile<{ person: Person }>(path.resolve(__dirname, './file.ts'), {
    parser: require('recast/parsers/typescript')
  });

  const { code } = generateCode(mod);
  console.log('code: ', code);
}

start2();
