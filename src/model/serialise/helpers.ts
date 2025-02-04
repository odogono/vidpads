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
