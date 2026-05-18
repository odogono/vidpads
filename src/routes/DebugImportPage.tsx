import { useEffect, useState } from 'react';

import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-json';

import { safeParseUrl } from '@helpers/url';
import { urlStringToProject } from '@model/serialise/project';
import { importStepSequencerPatternFromURLString } from '@model/serialise/stepSequencer';

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

export const DebugImportPage = () => {
  const [url, setUrl] = useState('');
  const [debugInfo, setDebugInfo] = useState<unknown>({});

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
          onChange={(event) => setUrl(event.target.value)}
          className='w-full p-2 border rounded-md text-black'
          placeholder='Paste URL here...'
        />
      </div>

      <div className='rounded-md overflow-hidden text-xs'>
        <pre>
          <code className='language-json'>
            {JSON.stringify(debugInfo, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  );
};

const parseUrl = async (url: string) => {
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
