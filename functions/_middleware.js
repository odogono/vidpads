/* eslint-disable */
// First, define the ElementHandler class
class ElementHandler {
  constructor(tags) {
    this.tags = tags;
  }

  element(element) {
    element.append(this.tags, { html: true });
  }
}

export default {
  async fetch(request) {
    const response = await fetch(request);
    // Clone the response so that it's no longer immutable
    const newResponse = new Response(response.body, response);

    const { searchParams, pathname } = new URL(request.url);
    const urlString = searchParams.get('d');
    if (!urlString) {
      return newResponse;
    }
    const firstPipe = urlString.indexOf('|');
    if (firstPipe === -1) {
      console.error('Invalid URL string');
      return newResponse;
    }
    const version = urlString.slice(0, firstPipe);
    const data = urlString.slice(firstPipe + 1);
    if (version !== '3') {
      console.error('Invalid Version', version);
      return newResponse;
    }
    const uncompressed = await decompress(data);
    if (!uncompressed) {
      return newResponse;
    }

    const [, projectName, projectBgImage] = uncompressed.split('|');

    console.debug('successfully read', { projectName, projectBgImage });

    // these are the metatags we want to inject into the site
    const ogtag = `
      <meta property="og:title" content="VO Pads - ${projectName}" />
      <meta property="og:description" content="VO Pads - ${projectName}" />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${request.url}" />
      <meta property="og:image" content="${projectBgImage || '/og-regular.png'}" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:width" content="1200" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="VO Pads - ${projectName}" />
      <meta name="twitter:description" content="VO Pads - ${projectName}" />
      <meta name="description" content="VO Pads - ${projectName}" />
    `;
    return new HTMLRewriter()
      .on('head', new ElementHandler(ogtag))
      .transform(newResponse);
  }
};

const decompress = async (data) => {
  try {
    // Convert base64 string back to ArrayBuffer
    const binaryStr = atob(data);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const decompressed = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream('deflate'));
    return await new Response(decompressed).text();
  } catch {
    return undefined;
  }
};
