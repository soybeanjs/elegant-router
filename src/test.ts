import micromatch from 'micromatch';

const isMatch = micromatch.isMatch('[id].tsx', '[[]*[]].{vue,tsx,jsx}');
console.log('isMatch: ', isMatch);
