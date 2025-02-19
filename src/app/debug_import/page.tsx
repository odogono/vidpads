'use client';

import { useEffect, useMemo, useState } from 'react';

// Import Prism core
import Prism from 'prismjs';

// Import theme CSS (this includes the core styles)
import 'prismjs/themes/prism-okaidia.css';
// Import language support
import 'prismjs/components/prism-json';

import { createLog } from '@helpers/log';
import { urlStringToProject } from '../../model/serialise/project';

const log = createLog('debug_import');

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
  const parsed = safeParseUrl(url);
  if (!parsed) {
    return {
      original: url,
      projectId: undefined,
      importData: undefined
    };
  }

  // Fix TypeScript type safety for URLSearchParams
  const projectId = parsed.searchParams.get('p');
  const importData = parsed.searchParams.get('d');

  const project = importData ? await urlStringToProject(importData) : undefined;

  return {
    original: url,
    projectId,
    importData,
    project
  };
};

const safeParseUrl = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
};
