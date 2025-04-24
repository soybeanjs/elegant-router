import { Project, SyntaxKind } from 'ts-morph';

async function main() {
  const project = new Project();

  const sourceFile = project.addSourceFileAtPath('src/debug/routes.ts');

  const routes = sourceFile.getVariableDeclaration('routes');

  if (routes) {
    const initializer = routes.getInitializer();
    if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      initializer.getElements().forEach(element => {
        if (element.isKind(SyntaxKind.ObjectLiteralExpression)) {
          const nameProperty = element.getProperty('name');
          if (nameProperty?.isKind(SyntaxKind.PropertyAssignment)) {
            const value = nameProperty.getInitializer();
            if (value?.isKind(SyntaxKind.StringLiteral)) {
              value.replaceWithText("'root'"); // 修改为新值
            }
          }
        }
      });
    }
  }

  sourceFile.saveSync();
}

main();
