import { Buffer } from 'node:buffer';

import { expect, test } from '@playwright/test';

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
);

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
  await expect(page.getByTestId('pad-a1-thumbnail')).toBeVisible();

  await openMenuItem(page, 'Export Project');
  const exportedJson = await page.getByLabel('JSON').inputValue();
  await page.getByRole('button', { name: 'Ok' }).click();

  await openMenuItem(page, 'New Project');
  await page.getByRole('button', { name: 'Ok' }).click();
  await expect(page.getByTestId('pad-a1-thumbnail')).toBeHidden();

  await openMenuItem(page, 'Import Project');
  await page.getByLabel('JSON').fill(exportedJson);
  await page.getByRole('button', { name: 'Ok' }).click();

  await expect(page.getByTestId('pad-a1-thumbnail')).toBeVisible();
});
