import { BUILT_AT } from '@/buildTime.config';
import { urlStringToProject } from '@model/serialise/project';

export interface PreviewMetadata {
  title: string;
  description: string;
  image: string;
  builtAt: string;
}

const DEFAULT_METADATA: PreviewMetadata = {
  title: 'VO Pads',
  description: 'Play, Edit, and Sequence your videos',
  image: '/og-regular.jpg',
  builtAt: BUILT_AT || 'unknown'
};

export const getPreviewMetadata = async (
  importData?: string | null
): Promise<PreviewMetadata> => {
  if (!importData) {
    return DEFAULT_METADATA;
  }

  try {
    const project = await urlStringToProject(importData);
    if (!project) return DEFAULT_METADATA;

    return {
      ...DEFAULT_METADATA,
      title: `VO Pads - ${project.name}`,
      image: project.bgImage ?? DEFAULT_METADATA.image
    };
  } catch {
    return DEFAULT_METADATA;
  }
};
