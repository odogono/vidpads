import { createLog } from './log';

const log = createLog('helpers/clipboard');

export const readFromClipboard = async () =>
  await navigator.clipboard.readText();

/*! clipboard-copy. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* global DOMException */

const makeError = () =>
  new DOMException('The request is not allowed', 'NotAllowedError');

const copyClipboardApi = async (text: string) => {
  // Use the Async Clipboard API when available. Requires a secure browsing
  // context (i.e. HTTPS)
  if (!navigator.clipboard) {
    throw makeError();
  }
  return navigator.clipboard.writeText(text);
};

const copyExecCommand = async (text: string) => {
  // Put the text to copy into a <span>
  const span = document.createElement('span');
  span.textContent = text;

  // Preserve consecutive spaces and newlines
  span.style.whiteSpace = 'pre';
  span.style.webkitUserSelect = 'auto';
  span.style.userSelect = 'all';

  // Add the <span> to the page
  document.body.appendChild(span);

  // Make a selection object representing the range of text selected by the user
  const selection = window.getSelection();
  const range = window.document.createRange();
  selection?.removeAllRanges();
  range.selectNode(span);
  selection?.addRange(range);

  // Copy text to the clipboard
  let success = false;
  try {
    success = window.document.execCommand('copy');
  } finally {
    // Cleanup
    selection?.removeAllRanges();
    window.document.body.removeChild(span);
  }

  if (!success) throw makeError();
};

export const writeToClipboard = async (text: string) => {
  try {
    await copyClipboardApi(text);
    return true;
  } catch (err) {
    log.warn('Failed to api copy to clipboard', { text, err });
    // ...Otherwise, use document.execCommand() fallback
    try {
      await copyExecCommand(text);
      return true;
    } catch (err2) {
      log.error('Failed to exec copy to clipboard', { text, err2 });
      return false;
    }
  }
};
