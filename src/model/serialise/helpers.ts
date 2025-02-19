import { getUnixTimeFromDate } from '@helpers/datetime';
import { exportPadToURLString } from '@model/serialise/pad';
import { exportSequencerToURLString } from '@model/serialise/sequencer';
import { ProjectStoreType } from '@model/store/types';

export const shortenUrl = (url: string) => {
  if (url.startsWith('youtu.be/')) {
    return url.replace('youtu.be/', '~y');
  }
  if (url.startsWith('https://youtu.be/')) {
    return url.replace('https://youtu.be/', '~y');
  }

  if (url.startsWith('https://')) {
    const urlWithoutProtocol = url.replace('https://', '');
    const encodedUrl = encodeURIComponent(urlWithoutProtocol);
    return `~s${encodedUrl}`;
  }

  if (url.startsWith('http://')) {
    const urlWithoutProtocol = url.replace('http://', '');
    const encodedUrl = encodeURIComponent(urlWithoutProtocol);
    return `~h${encodedUrl}`;
  }

  if (url.startsWith('odgn-vo://')) {
    const urlWithoutProtocol = url.replace('odgn-vo://', '');
    const encodedUrl = encodeURIComponent(urlWithoutProtocol);
    return `~v${encodedUrl}`;
  }

  return url;
};

export const expandUrl = (url: string) => {
  if (url.startsWith('~y')) {
    return url.replace('~y', 'https://youtu.be/');
  }

  if (url.startsWith('~v')) {
    const urlWithoutProtocol = url.replace('~v', '');
    const decodedUrl = decodeURIComponent(urlWithoutProtocol);
    return `odgn-vo://${decodedUrl}`;
  }

  if (url.startsWith('~s')) {
    const urlWithoutProtocol = url.replace('~s', '');
    const decodedUrl = decodeURIComponent(urlWithoutProtocol);
    return `https://${decodedUrl}`;
  }

  if (url.startsWith('~h')) {
    const urlWithoutProtocol = url.replace('~h', '');
    const decodedUrl = decodeURIComponent(urlWithoutProtocol);
    return `http://${decodedUrl}`;
  }

  return url;
};

export const exportToURLCommon = (project: ProjectStoreType) => {
  const { context } = project.getSnapshot();

  const {
    projectId,
    projectName,
    projectBgImage,
    createdAt,
    updatedAt,
    pads,
    sequencer
  } = context;

  const sequencerURL = sequencer ? exportSequencerToURLString(sequencer) : '';

  const padsURL = pads.map((pad) => exportPadToURLString(pad)).filter(Boolean);

  const createTimeSecs = getUnixTimeFromDate(createdAt);
  const updateTimeSecs = getUnixTimeFromDate(updatedAt);

  return {
    context,
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  };
};

export const addPadsAndSequencerToResult = (
  result: string,
  padsURL: (string | undefined)[],
  sequencerURL?: string
) => {
  if (padsURL.length > 0) {
    result += `|${padsURL.join('(')}`;
  } else {
    result += '|';
  }

  result += '|';
  if (sequencerURL) {
    result += sequencerURL;
  }

  return result;
};
