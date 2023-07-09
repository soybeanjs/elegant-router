import { generateCode, parseModule } from 'magicast';

interface Person {
  name: string;
  age: number;
}

function start() {
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

  const mod = parseModule<Person>(code1, { parser: require('recast/parsers/typescript') });

  mod.exports.person.component = '() => Promise.resolve(1)';
  // (mod.exports as any).default.person.gender = 'male';

  const { code, map } = generateCode(mod);
  console.log('map: ', map);
  console.log('code: ', code);
  console.log('success');
}

start();
