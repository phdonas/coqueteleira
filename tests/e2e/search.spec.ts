import { test, expect } from '@playwright/test';

test('API /api/search por nome retorna itens', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/search?q=negroni`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(Array.isArray(json.items)).toBe(true);
});

test('API /api/search por ingrediente retorna itens', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/search?ingredient=gin&page=1&pageSize=5`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(json.page).toBe(1);
  expect(json.pageSize).toBe(5);
});
