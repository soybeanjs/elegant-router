import MagicString from 'magic-string';

export function setRouteNamePageFile(code: string, _id: string, routeName: string) {
  const SCRIPT_SETUP = /<script\s+setup[\s\S]*?>/;

  if (!SCRIPT_SETUP.test(code)) {
    return null;
  }

  const s: MagicString = new MagicString(code);

  const SCRIPT_START_REG = /<script[\s\S]*?>/;

  const DEFINE_OPTION = /defineOptions\(\{[^}]+?\}\)/;

  const NAME_REG = /(?<=name:\s*['|"])\w+(?=['|"])/;

  if (DEFINE_OPTION.test(s.toString())) {
    s.replace(DEFINE_OPTION, match => {
      const matchName = match.replace(NAME_REG, () => routeName);

      return matchName;
    });
  } else {
    s.replace(
      SCRIPT_START_REG,
      match => `${match}
defineOptions({
  name: "${routeName}"
});
`
    );
  }

  return {
    map: s.generateMap(),
    code: s.toString()
  };
}
