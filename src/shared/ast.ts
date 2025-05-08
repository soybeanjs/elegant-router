import { SyntaxKind } from 'ts-morph';
import type { Expression } from 'ts-morph';

export function getObjectProperty(element: Expression, propertyName: string) {
  if (!element.isKind(SyntaxKind.ObjectLiteralExpression)) return null;

  const property = element.getProperty(propertyName);
  if (!property?.isKind(SyntaxKind.PropertyAssignment)) return null;

  const value = property.getInitializer();

  return value || null;
}

export function getStringProperty(element: Expression, propertyName: string) {
  const value = getObjectProperty(element, propertyName);
  if (!value?.isKind(SyntaxKind.StringLiteral)) return null;

  return value;
}

export function updateStringProperty(element: Expression, propertyName: string, newValue: string) {
  const value = getStringProperty(element, propertyName);
  if (!value) return;

  value.replaceWithText(`'${newValue}'`);
}
