interface Person {
  name: string;
  age: number;
  gender?: 'male' | 'female';
  component?: (() => Promise<any>) | string;
}

export const person: Person = {
  name: 'Soybean',
  age: 25,
  gender: 'male',
  component: ''
};
