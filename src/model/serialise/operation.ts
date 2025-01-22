import { roundNumberToDecimalPlaces } from '@helpers/number';
import {
  Operation,
  OperationExport,
  OperationType,
  TrimOperation
} from '@model/types';

export const exportOperationToURLString = (
  operation: Operation | undefined
): string | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return `${operation.type},${roundNumberToDecimalPlaces(start)},${roundNumberToDecimalPlaces(end)}`;
  }

  throw new Error(`Unsupported operation type: ${operation.type}`);
};

export const importOperationFromURL = (
  urlString: string
): OperationExport | undefined => {
  const [type, start, end] = urlString.split(',');

  if (type === OperationType.Trim) {
    return {
      type: OperationType.Trim,
      start: parseFloat(start),
      end: parseFloat(end)
    } as TrimOperation;
  }

  return undefined;
};

export const exportOperationToJSON = (
  operation: Operation | undefined
): OperationExport | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return {
      type: operation.type,
      start: roundNumberToDecimalPlaces(start),
      end: roundNumberToDecimalPlaces(end)
    } as TrimOperation;
  }

  return undefined;
};

export const importOperationFromJSON = (
  operation: OperationExport | undefined
): Operation | undefined => {
  if (!operation) {
    return undefined;
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return { type: OperationType.Trim, start, end } as TrimOperation;
  }

  return undefined;
};

export const exportOperationToURL = (
  operation: Operation | undefined
): string | undefined => {
  if (!operation) {
    return '';
  }

  if (operation.type === OperationType.Trim) {
    const { start, end } = operation as TrimOperation;
    return `${operation.type}:${roundNumberToDecimalPlaces(start)}:${roundNumberToDecimalPlaces(end)}`;
  }

  return '';
};
