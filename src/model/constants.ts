// export const QUERY_KEY_PAD_THUMBNAIL = 'pad-thumbnail';
// export const QUERY_KEY_PROJECT = 'project';
// export const QUERY_KEY_PROJECTS = 'projects';
// export const QUERY_KEY_STATE = 'store-state';
// export const QUERY_KEY_STORE_INITIALISE = 'store-initialise';

// todo - move to using these keys instead of the above
export const VOKeys = {
  all: ['odgnVO'] as const,

  projects: () => [...VOKeys.all, 'projects'] as const,
  projectDetails: () => [...VOKeys.projects(), 'details'] as const,
  project: (projectId: string) => [...VOKeys.projects(), projectId] as const,

  allPads: () => [...VOKeys.all, 'pads'] as const,
  pads: (projectId: string) => [...VOKeys.all, 'pad', projectId] as const,
  pad: (projectId: string, padId: string) =>
    [...VOKeys.pads(projectId), padId] as const,
  padThumbnail: (projectId: string, padId: string) =>
    [...VOKeys.pad(projectId, padId), 'thumbnail'] as const,
  padInterval: (projectId: string, padId: string) =>
    [...VOKeys.pad(projectId, padId), 'interval'] as const,

  allMetadata: () => [...VOKeys.all, 'metadata'] as const,
  metadata: (mediaUrl: string) => [...VOKeys.allMetadata(), mediaUrl] as const,

  players: () => [...VOKeys.all, 'player'] as const,
  player: (playerId: string) => [...VOKeys.players(), playerId] as const,

  // mutation key
  updatePlayer: (playerId: string) =>
    [...VOKeys.players(), playerId, 'update'] as const,
  // mutation key
  deletePlayer: (playerId: string) =>
    [...VOKeys.players(), playerId, 'delete'] as const
};
