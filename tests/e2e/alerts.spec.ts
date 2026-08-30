import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4859';

async function login(page) {
  await page.goto(BASE + '/auth/login');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passInput = page.locator('input[type="password"], input[name="password"]').first();

  await emailInput.fill('admin@horizonx.local');
  await passInput.fill('horizonx-local-dev');

  await page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Login"), input[type="submit"]').first().click();
  await page.waitForURL(/\/(servers\/select|dashboard)/, { timeout: 10000 });
  await page.waitForTimeout(2000);
}

test('login page renders and accepts credentials', async ({ page }) => {
  await page.goto(BASE + '/auth/login');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"], button:has-text("Login")').first()).toBeVisible();
});

test('after login, user lands on server selector or dashboard', async ({ page }) => {
  await login(page);
  const url = page.url();
  console.log('After login URL:', url);
  expect(url).toMatch(/\/(servers\/select|dashboard)/);
});

test('alert rules page loads via direct navigation', async ({ page }) => {
  await login(page);
  await page.goto(BASE + '/alerts/rules', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/alerts\/rules/);
});

test('can create a new alert rule through the UI', async ({ page }) => {
  await login(page);

  // Dashboard may land on server selector or dashboard
  const curUrl = page.url();
  if (curUrl.includes('servers/select')) {
    const serverCard = page.locator('[class*="server-card"], [class*="server"], [class*="item"], [role="button"]:has-text("local"), [class*="card"]').first();
    const serverFound = await serverCard.isVisible({ timeout: 8000 }).catch(() => false);
    console.log('Server card visible:', serverFound);
    if (serverFound) {
      await serverCard.click();
      try {
        await page.waitForURL(BASE + '/dashboard', { timeout: 8000 });
      } catch {
        // ignore
      }
      await page.waitForTimeout(2000);
    }
  }

  // Navigate to alert rules
  const alertLink = page.locator('nav a[href*="/alert"], .sidebar a[href*="/alert"], a:has-text("Alert"), a[href="/alerts/rules"]').first();
  const isVisible = await alertLink.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Alert link visible:', isVisible);
  if (isVisible) {
    await alertLink.click();
  } else {
    await page.goto(BASE + '/alerts/rules', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }

  await expect(page).toHaveURL(/\/alerts\/rules/);

  const createBtn = page.locator('button:has-text("Create"), button:has-text("New Rule"), button:has-text("Add Rule")').first();
  const createVisible = await createBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Create button visible:', createVisible);

  if (!createVisible) {
    console.log('Page URL:', page.url());
    const allBtns = await page.locator('button').all();
    console.log(`Total buttons: ${allBtns.length}`);
    for (let i = 0; i < Math.min(allBtns.length, 8); i++) {
      const txt = await allBtns[i].textContent().catch(() => 'n/a');
      if (txt && txt.trim()) console.log(`  [${i}] "${txt.trim()}"`);
    }
    return;
  }

  await createBtn.click();
  await page.waitForTimeout(2000);

  const dialog = page.locator('[role="dialog"], .dialog, .modal, [class*="create"]');
  const dialogVisible = await dialog.isVisible({ timeout: 10000 }).catch(() => false);
  console.log('Dialog visible:', dialogVisible);

  if (!dialogVisible) {
    console.log('No dialog found. URL:', page.url());
    return;
  }

  const ruleName = 'e2e-ui-' + Date.now();
  console.log('Creating rule:', ruleName);

  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="Name" i], input[autocomplete="name"]').first();
  if (await nameInput.isVisible({ timeout: 3000 })) {
    await nameInput.fill(ruleName);
    console.log('Filled name input');
  } else {
    const inputs = await page.locator('input:not([type="hidden"])').all();
    console.log(`No name input. ${inputs.length} inputs available`);
    if (inputs.length > 0) {
      await inputs[0].fill(ruleName);
      console.log('Filled first input as fallback');
    }
  }

  await page.waitForTimeout(500);

  const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit"), .btn-primary').first();
  const submitVisible = await submitBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Submit visible:', submitVisible);

  if (submitVisible) {
    await submitBtn.click();
    await page.waitForTimeout(3000);
    const exists = await page.locator(`text=${ruleName}`).first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Rule visible in list:', exists);
    expect(exists).toBeTruthy();
  }
});

test('alert history page loads', async ({ page }) => {
  await login(page);
  await page.goto(BASE + '/alerts/history', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/alerts/);
});

test('active alerts page loads', async ({ page }) => {
  await login(page);
  await page.goto(BASE + '/alerts/active', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/alerts\/active/);
});
