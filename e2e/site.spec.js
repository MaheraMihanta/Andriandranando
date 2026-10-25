import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const python = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');

test('navigation, published news, filters, credits, and responsive layouts', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Nos racines.');
  await expect(page.locator('.hero-visual img')).toHaveJSProperty('naturalWidth', 1799);
  await expect(page.getByRole('heading', { name: 'Rencontre de test navigateur' })).toBeVisible();
  await expect(page.getByText('Brouillon privé de test')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/accueil-desktop.png', fullPage: true });
  await page.getByRole('navigation').getByRole('link', { name: 'Actualités' }).click();
  await page.getByText('Lire l’actualité').click();
  await expect(page.getByText('Première ligne de test.')).toBeVisible();
  await page.getByRole('button', { name: 'Mémoire et patrimoine' }).click();
  await expect(page.getByText('Aucune nouvelle dans cette catégorie.')).toBeVisible();
  await page.getByRole('button', { name: 'Rencontres', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Rencontre de test navigateur' })).toBeVisible();
  await page.getByRole('link', { name: 'Crédits photos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ambohimanga', exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['accueil', 'actualites', 'inscriptions', 'credits']) {
      await page.goto(`/#${route}`);
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasOverflow, `${route} overflows at ${width}px`).toBe(false);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#inscriptions');
  await page.screenshot({ path: 'test-results/inscriptions-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('registration validates, handles API errors, and saves every field to Django', async ({ page }) => {
  await page.goto('/#inscriptions');
  await page.getByRole('button', { name: 'Enregistrer mon inscription' }).click();
  expect(await page.locator('#nom').evaluate((input) => input.validity.valueMissing)).toBe(true);
  const payload = { nom: 'Navigateur', prenom: 'Test', village: 'Vohitra de test', contact: '+261 34 00 000 00', email: 'test-navigateur@example.com', profession: 'Activité de test', adresse: 'Adresse de test', historique: 'Historique familial de test', tombeau_lieu: 'Lieu de test', tombeau_numero: 'T-042' };
  for (const [field, value] of Object.entries(payload)) await page.locator(`#${field}`).fill(value);
  await page.locator('#consentement').check();
  await page.route('**/api/inscriptions', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ errors: { email: [{ message: 'Adresse à vérifier pour ce test.' }] } }) }), { times: 1 });
  await page.getByRole('button', { name: 'Enregistrer mon inscription' }).click();
  await expect(page.getByText('Adresse à vérifier pour ce test.')).toBeVisible();
  await expect(page.locator('#nom')).toHaveValue('Navigateur');
  await page.getByRole('button', { name: 'Enregistrer mon inscription' }).click();
  await expect(page.getByRole('heading', { name: 'Misaotra !' })).toBeVisible();
  const result = JSON.parse(execFileSync(python, ['-c', 'import sqlite3,json,sys; c=sqlite3.connect(sys.argv[1]); c.row_factory=sqlite3.Row; row=c.execute("SELECT * FROM posts_personne WHERE email=?", ("test-navigateur@example.com",)).fetchone(); print(json.dumps(dict(row)))', process.env.E2E_DATABASE_PATH], { encoding: 'utf8' }));
  for (const [field, value] of Object.entries(payload)) expect(result[field]).toBe(value);
  expect(result.consentement).toBe(1);
});

test('news unavailable state offers a retry', async ({ page }) => {
  await page.route('**/api/actualites', (route) => route.fulfill({ status: 502, contentType: 'application/json', body: '{}' }));
  await page.goto('/#actualites');
  const retry = page.getByRole('button', { name: 'Réessayer' });
  await expect(retry).toBeVisible();
  await page.unroute('**/api/actualites');
  await retry.click();
  await expect(page.getByRole('heading', { name: 'Rencontre de test navigateur' })).toBeVisible();
});
