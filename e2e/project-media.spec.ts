import { Buffer } from 'node:buffer';

import { expect, test } from '@playwright/test';

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);
const sharedProjectData =
  '4%7CeJyV0MtOwkAUBuBXcdmEOMyZa%2BckLEQtYtIFl6Kkq%2BlQbbFFAhWpaXx203gjsRu3k%2FP955%2BTWmpT7QyTzXhTpTvrqvyQnl3tXsqz0Los36RNVlXbPfb7OcnLx5cdcc9lf701N2rIyWP%2B0IDmxlfMKNOAFlQY42vWWIgTnJTBm6ujOrye1qs7WoTri2Nvj%2B81r6fH89VK37p9r0KGjBime1sEpIieZXGCEZOZK6MiXA%2Bv3WZR3c7Hr%2BFkMOjwAiWRTHx5hp7l%2FwtQqAlo%2BVtAtOXZ8eDY4ql1s9FTmzNe3k%2B6vE8oSDSEi%2B8SgJ6VcYJzPiySvL1Atv0MCmhHAFAEIELxE67iBGejYmMvozoMpoekuzswBE64PjmfbhePDG8XLkam6lICQRJh1K%2Fy2z%2FzolqWwb5LaKIBwRBFf1DTGBpb8ARXhqJlnq%2B5j1Z8P0iPgS9k73QEpGB%2FRz4AXGW%2FAQ%3D%3D';

const addImageToFirstPad = async (page: import('@playwright/test').Page) => {
  await page.getByTestId('pad-a1').click();
  await expect(page.getByText('Select Media Source')).toBeVisible();
  await page.getByTestId('media-source-file-input').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: pixelPng
  });
  await expect(page.getByTestId('pad-a1-thumbnail')).toBeVisible();
};

const openMenuItem = async (
  page: import('@playwright/test').Page,
  name: string
) => {
  const menuButton = page.getByLabel('Open menu');
  const menuItem = page.getByRole('menuitem', { name });

  await expect(menuButton).toBeVisible();

  for (let attempt = 0; attempt < 2; attempt++) {
    await menuButton.click();
    try {
      await menuItem.waitFor({ state: 'visible', timeout: 1_000 });
      break;
    } catch {
      if (attempt === 1) {
        throw new Error(`Menu item "${name}" did not open`);
      }
    }
  }

  await menuItem.click();
};

test('loads the player surface', async ({ page }) => {
  await page.goto('/player');

  await expect(page.getByTestId('player-surface')).toBeVisible();
  await expect(page.getByTestId('pad-a1')).toBeVisible();
});

test('renders project-specific metadata for shared project URLs', async ({
  request
}) => {
  const response = await request.get(
    `/player?p=ea0ae7c925&d=${sharedProjectData}`
  );
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain('<title>VO Pads - Interactive Drum Machine</title>');
  expect(html).toContain(
    '<meta property="og:title" content="VO Pads - Interactive Drum Machine"'
  );
  expect(html).toContain('property="og:image"');
});

test('saves, loads, exports, and imports a project with a pad media source', async ({
  page
}) => {
  test.setTimeout(60_000);

  await page.goto('/player');

  await addImageToFirstPad(page);

  await openMenuItem(page, 'Save Project');
  await page.getByLabel('Name').fill('E2E Project');
  await page.getByRole('button', { name: 'Ok' }).click();

  await openMenuItem(page, 'New Project');
  await page.getByRole('button', { name: 'Ok' }).click();
  await expect(page.getByTestId('pad-a1-thumbnail')).toBeHidden();

  await openMenuItem(page, 'Load Project');
  await page.getByText('E2E Project').click();
  await page.getByRole('button', { name: 'Ok' }).click();
  await expect(page.getByText('E2E Project')).toBeVisible();
  await expect(page.getByTestId('pad-a1-thumbnail')).toBeVisible();

  await openMenuItem(page, 'Export Project');
  const exportedJson = await page.getByLabel('JSON').inputValue();
  expect(exportedJson).toContain('"name":"E2E Project"');
  await page.getByRole('button', { name: 'Ok' }).click();

  await openMenuItem(page, 'New Project');
  await page.getByRole('button', { name: 'Ok' }).click();
  await expect(page.getByTestId('pad-a1-thumbnail')).toBeHidden();

  await openMenuItem(page, 'Import Project');
  await page.getByLabel('JSON').fill(exportedJson);
  await page.getByRole('button', { name: 'Ok' }).click();

  await expect(page.getByTestId('pad-a1-thumbnail')).toBeVisible();
});
