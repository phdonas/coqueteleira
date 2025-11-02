import { test, expect } from '@playwright/test';

test('Home carrega e renderiza o header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Biblioteca Pessoal')).toBeVisible();
});

test('Lista de receitas da API e abre detalhe', async ({ request, page, baseURL }) => {
  const res = await request.get(`${baseURL}/api/recipes`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(Array.isArray(json.items)).toBe(true);

  if (json.items.length > 0) {
    const id = json.items[0].id;
    await page.goto(`/recipe/${id}`);
    await expect(page.locator('h1')).toBeVisible();
  }
});
