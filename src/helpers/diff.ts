import { diff as basicDiff, detailedDiff } from 'deep-object-diff';

export const isObjectEqual = (a: object, b: object) => {
  return Object.keys(basicDiff(a, b)).length === 0;
};

export const getObjectDiff = (a: object, b: object) => {
  return detailedDiff(a, b);
};
