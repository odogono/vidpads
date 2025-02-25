'use client';

import { useEffect, useState } from 'react';

// Import Prism core
import Prism from 'prismjs';

// Import theme CSS (this includes the core styles)
import 'prismjs/themes/prism-okaidia.css';
// Import language support
import 'prismjs/components/prism-json';

import { safeParseUrl } from '@helpers/url';
// import { createLog } from '@helpers/log';
import { urlStringToProject } from '@model/serialise/project';
import { importStepSequencerPatternFromURLString } from '@model/serialise/stepSequencer';

// const log = createLog('debug_import');

// Simplify the styles
const styles = {
  jsonContainer: `
    pre {
      margin: 0;
      padding: 1em;
      border-radius: 0.3em;
      background: #272822;
    }
  `
};

export default function DebugImportPage() {
  const [url, setUrl] = useState('');
  const [debugInfo, setDebugInfo] = useState<unknown>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add new useEffect to re-highlight when url changes
  useEffect(() => {
    parseUrl(url).then(setDebugInfo);
  }, [url]);

  useEffect(() => {
    Prism.highlightAll();
  }, [debugInfo]);

  return (
    <div className='p-4 max-w-4xl mx-auto h-screen'>
      <style>{styles.jsonContainer}</style>
      <h1 className='text-2xl font-bold mb-4'>URL Debug Tool</h1>

      <div className='mb-6'>
        <label htmlFor='urlInput' className='block text-sm font-medium mb-2'>
          Enter URL to debug
        </label>
        <input
          id='urlInput'
          type='text'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className='w-full p-2 border rounded-md text-black'
          placeholder='Paste URL here...'
        />
      </div>

      <div className='rounded-md overflow-hidden text-xs'>
        <pre>
          {isMounted && (
            <code className='language-json'>
              {JSON.stringify(debugInfo, null, 2)}
            </code>
          )}
        </pre>
      </div>
    </div>
  );
}

const parseUrl = async (url: string) => {
  // const project = await parseProjectUrl(url);
  const pattern = parseStepSequencerPatternUrl(url);

  if (pattern) {
    return pattern;
  }

  const project = await parseProjectUrl(url);

  if (project) {
    return project;
  }

  return {
    original: url
  };
};

const parseProjectUrl = async (urlString: string) => {
  if (!urlString || !urlString.startsWith('http')) return undefined;

  const parsed = safeParseUrl(urlString);
  if (!parsed) {
    return undefined;
  }

  // Fix TypeScript type safety for URLSearchParams
  const projectId = parsed.searchParams.get('p');
  const importData = parsed.searchParams.get('d');

  const project = importData ? await urlStringToProject(importData) : undefined;

  return {
    original: urlString,
    length: urlString.length,
    version: importData?.split('|')?.[0] ?? 'n/a',
    projectId,
    importData,
    project
  };
};

const parseStepSequencerPatternUrl = (urlString: string) => {
  if (!urlString.startsWith('odgn-vo://stepSeq')) return undefined;

  const url = safeParseUrl(urlString);
  if (!url) {
    return undefined;
  }

  const data = url.searchParams.get('pattern');
  if (!data) return undefined;

  const pattern = importStepSequencerPatternFromURLString(data);

  return {
    original: urlString,
    pattern
  };
};
