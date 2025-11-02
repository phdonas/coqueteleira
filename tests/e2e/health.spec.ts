import { test, expect } from '@playwright/test';

test('API supa-health está OK', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/api/supa-health`);
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(json.authed).toBe(true);
});
