// tests/plans-view.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PlansView (Playwright E2E)', () => {
    // Assumes dev server runs frontend at http://localhost:5173 and backend at http://localhost:3000
    // Run with: npm run dev, then `npx playwright test`

    test.beforeEach(async ({ page }) => {
        // Clear persisted state (localStorage + backend JSON if needed)
        await page.context().clearCookies();
        await page.addInitScript(() => localStorage.clear());
        await page.goto('http://localhost:5173/');
        // Navigate to Plans tab if not default
        await page.getByRole('tab', { name: /Plans/i }).click({ trial: true }).catch(() => {});
        await page.getByRole('tab', { name: /Plans/i }).click().catch(() => {});
    });

    test('renders empty state when there are no plans', async ({ page }) => {
        await expect(page.getByText('Workout Plans')).toBeVisible();
        await expect(page.getByText('No workout plans yet')).toBeVisible();
        await expect(page.getByRole('button', { name: /Create Your First Plan/i })).toBeVisible();
    });

    test('opens dialog and saves a new plan from empty state', async ({ page }) => {
        await page.getByRole('button', { name: /Create Your First Plan/i }).click();

        // Dialog with PlanEditor should appear; verify creating state by presence of Save button
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /Save Plan/i }).click();

        // Toast confirms creation
        await expect(page.getByText('Plan created!')).toBeVisible();

        // New plan card appears
        await expect(page.getByTestId('card')).toBeVisible();
    });

    test('renders existing plans and allows delete', async ({ page }) => {
        // Seed two plans via UI
        await page.getByRole('button', { name: /Create Your First Plan/i }).click();
        await page.getByRole('button', { name: /Save Plan/i }).click();
        await page.getByText('Plan created!').waitFor();

        // Add second plan
        await page.getByRole('button', { name: /New Plan/i }).click().catch(() => {
            // If there is a "New Plan" button in non-empty state
            const addBtn = page.locator('button').filter({ hasText: 'New Plan' });
            return addBtn.click();
        });
        await page.getByRole('button', { name: /Save Plan/i }).click();
        await page.getByText('Plan created!').waitFor();

        // Expect two plan cards, check exercise counts text exists
        await expect(page.getByText(/1 exercises|2 exercises/)).toBeVisible();

        // Click delete on first card (icon-only button). Target by aria-label if provided; fallback to nth icon button.
        const deleteBtn = page.getByRole('button', { name: /Delete Plan/i }).first();
        const exists = await deleteBtn.isVisible();
        if (exists) {
            await deleteBtn.click();
        } else {
            // Fallback: click the second icon-only button within first card
            const firstCard = page.getByTestId('card').first();
            await firstCard.locator('button[aria-label], button:has-text("")').nth(1).click();
        }

        await expect(page.getByText('Plan deleted')).toBeVisible();
    });

    test('edits an existing plan via dialog and saves updates', async ({ page }) => {
        // Ensure at least one plan exists
        const hasCard = await page.getByTestId('card').first().isVisible();
        if (!hasCard) {
            await page.getByRole('button', { name: /Create Your First Plan/i }).click();
            await page.getByRole('button', { name: /Save Plan/i }).click();
            await page.getByText('Plan created!').waitFor();
        }

        // Click edit icon on first card
        const editBtn = page.getByRole('button', { name: /Edit Plan/i }).first();
        const editVisible = await editBtn.isVisible();
        if (editVisible) {
            await editBtn.click();
        } else {
            const firstCard = page.getByTestId('card').first();
            await firstCard.locator('button[aria-label], button:has-text("")').nth(0).click();
        }

        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /Save Plan/i }).click();

        await expect(page.getByText('Plan updated!')).toBeVisible();
    });

    test('clicking Start Workout shows info toast and does not mutate plans', async ({ page }) => {
        // Ensure a plan exists
        const hasCard = await page.getByTestId('card').first().isVisible();
        if (!hasCard) {
            await page.getByRole('button', { name: /Create Your First Plan/i }).click();
            await page.getByRole('button', { name: /Save Plan/i }).click();
            await page.getByText('Plan created!').waitFor();
        }

        // Count current number of cards
        const initialCount = await page.getByTestId('card').count();

        await page.getByRole('button', { name: /Start Workout/i }).first().click();

        await expect(page.getByText('Starting workout - switch to Workout tab')).toBeVisible();

        // Ensure plans did not change
        await expect(page.getByTestId('card')).toHaveCount(initialCount);
    });
});
