export const VOKeys = {
  all: ['odgnVO'] as const,

  allSettings: () => [...VOKeys.all, 'settings'] as const,
  settings: (id: string) => [...VOKeys.allSettings(), id] as const,

  preferences: () => [...VOKeys.settings('preferences')] as const,
  keyboard: () => [...VOKeys.settings('keyboard')] as const,

  midiStore: () => [...VOKeys.all, 'midiStore'] as const,

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
