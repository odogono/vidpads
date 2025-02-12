import { TriggerEvent } from '../types';

export interface TriggerNode {
  event: TriggerEvent;
  left: TriggerNode | undefined;
  right: TriggerNode | undefined;
}

export const triggerTreeCount = (node: TriggerNode | undefined): number => {
  if (!node) return 0;
  return 1 + triggerTreeCount(node.left) + triggerTreeCount(node.right);
};

export const triggerTreeToEvents = (
  node: TriggerNode | undefined
): TriggerEvent[] => {
  if (!node) return [];
  return [
    node.event,
    ...triggerTreeToEvents(node.left),
    ...triggerTreeToEvents(node.right)
  ];
};

export const insertTriggerEvent = (
  node: TriggerNode | undefined,
  event: TriggerEvent
) => {
  if (!node) {
    return {
      event,
      left: undefined,
      right: undefined
    };
  }

  if (event.time < node.event.time) {
    node.left = insertTriggerEvent(node.left, event);
  } else {
    node.right = insertTriggerEvent(node.right, event);
  }
  return node;
};

export const findNextTriggerEvent = (
  node: TriggerNode | undefined,
  time: number,
  nearest?: TriggerEvent | undefined
): TriggerEvent | undefined => {
  if (!node) return nearest;
  if (node.event.time > time) {
    nearest = !nearest || node.event.time < nearest.time ? node.event : nearest;
    return findNextTriggerEvent(node.left, time, nearest);
  } else {
    return findNextTriggerEvent(node.right, time, nearest);
  }
};

export const findPreviousTriggerEvent = (
  node: TriggerNode | undefined,
  time: number,
  nearest?: TriggerEvent | undefined
): TriggerEvent | undefined => {
  if (!node) return nearest;
  if (node.event.time < time) {
    nearest = !nearest || node.event.time > nearest.time ? node.event : nearest;
    return findPreviousTriggerEvent(node.right, time, nearest);
  } else {
    return findPreviousTriggerEvent(node.left, time, nearest);
  }
};

export const findTriggerEventsWithinTimeRange = (
  node: TriggerNode | undefined,
  startTime: number,
  endTime: number
): TriggerEvent[] => {
  const events: TriggerEvent[] = [];

  const collectEvents = (node: TriggerNode | undefined) => {
    if (!node) return;

    // If current node's time is greater than endTime, only check left subtree
    if (node.event.time > endTime) {
      collectEvents(node.left);
      return;
    }

    // If current node's time is less than startTime, only check right subtree
    if (node.event.time < startTime) {
      collectEvents(node.right);
      return;
    }

    // If we're here, current node is within range
    // Check left subtree first to maintain time order
    collectEvents(node.left);
    events.push(node.event);
    collectEvents(node.right);
  };

  collectEvents(node);
  return events;
};
