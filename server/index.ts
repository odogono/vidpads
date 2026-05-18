import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPreviewMetadata, PreviewMetadata } from '@/page/previewMetadata';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const indexPath = join(distDir, 'index.html');
const port = Number(process.env.SERVER_PORT ?? process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? '0.0.0.0';

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const toAbsoluteUrl = (request: IncomingMessage, value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const host = request.headers.host ?? `localhost:${port}`;
  const proto = request.headers['x-forwarded-proto'] ?? 'http';
  return `${proto}://${host}${value.startsWith('/') ? value : `/${value}`}`;
};

const renderHtml = (
  html: string,
  metadata: PreviewMetadata,
  request: IncomingMessage
) => {
  return html
    .replaceAll('__VO_META_TITLE__', escapeHtml(metadata.title))
    .replaceAll('__VO_META_DESCRIPTION__', escapeHtml(metadata.description))
    .replaceAll('__VO_META_IMAGE__', escapeHtml(toAbsoluteUrl(request, metadata.image)))
    .replaceAll('__VO_META_BUILT_AT__', escapeHtml(metadata.builtAt));
};

const isAssetRequest = (pathname: string): boolean => {
  return Boolean(extname(pathname));
};

const getStaticPath = (pathname: string): string | null => {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  const target = resolve(distDir, normalized.slice(1));

  if (!target.startsWith(distDir)) {
    return null;
  }

  return target;
};

let indexHtml: string;

const sendStaticFile = (response: ServerResponse, filePath: string) => {
  const ext = extname(filePath);
  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!response.headersSent) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
  stream.on('open', () => {
    response.writeHead(200, {
      'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable'
    });
  });
  stream.pipe(response);
};

const sendHtml = async (
  request: IncomingMessage,
  response: ServerResponse,
  url: URL
) => {
  const metadata = await getPreviewMetadata(url.searchParams.get('d'));
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(renderHtml(indexHtml, metadata, request));
};

const handler = async (request: IncomingMessage, response: ServerResponse) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    if (isAssetRequest(url.pathname)) {
      const filePath = getStaticPath(url.pathname);
      if (filePath) {
        sendStaticFile(response, filePath);
        return;
      }

      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    await sendHtml(request, response, url);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal server error');
  }
};

createServer(handler).listen(port, hostname, async () => {
  indexHtml = await readFile(indexPath, 'utf8');
  console.info(`VO Pads server listening on http://${hostname}:${port}`);
});
