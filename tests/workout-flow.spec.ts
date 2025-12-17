import { test, expect } from '@playwright/test';

test.describe('Workout Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('complete workout flow: create plan, start workout, complete sets, and verify in progress', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Step 1: Create a workout plan
    await test.step('Create a workout plan', async () => {
      // Navigate to Plans tab
      await page.getByRole('tab', { name: /plans/i }).click();
      
      // Click New Plan button
      await page.getByRole('button', { name: /new plan/i }).click();
      
      // Fill in plan details
      await page.getByLabel('Plan Name').fill('Push Day Test');
      await page.getByLabel('Description').fill('Test chest and shoulders workout');
      
      // Add first exercise
      await page.getByRole('button', { name: /add exercise/i }).click();
      
      // Configure first exercise
      await page.getByLabel('Exercise').first().click();
      await page.getByRole('option', { name: /bench press/i }).click();
      await page.getByLabel('Sets').first().fill('3');
      await page.getByLabel('Reps').first().fill('10');
      await page.getByLabel(/weight/i).first().fill('135');
      
      // Add second exercise
      await page.getByRole('button', { name: /add exercise/i }).click();
      
      // Configure second exercise
      const exerciseSelects = page.getByLabel('Exercise');
      await exerciseSelects.nth(1).click();
      await page.getByRole('option', { name: /shoulder press/i }).click();
      await page.getByLabel('Sets').nth(1).fill('3');
      await page.getByLabel('Reps').nth(1).fill('12');
      await page.getByLabel(/weight/i).nth(1).fill('50');
      
      // Save plan
      await page.getByRole('button', { name: /save plan/i }).click();
      
      // Verify plan was created
      await expect(page.getByText('Push Day Test')).toBeVisible();
    });

    // Step 2: Start the workout
    await test.step('Start the workout', async () => {
      // Navigate to Workout tab
      await page.getByRole('tab', { name: /^workout$/i }).click();
      
      // Verify plan is available
      await expect(page.getByText('Push Day Test')).toBeVisible();
      
      // Click Start Workout
      await page.getByRole('button', { name: /start workout/i }).click();
      
      // Verify workout started
      await expect(page.getByRole('heading', { name: 'Push Day Test' })).toBeVisible();
      await expect(page.getByText('Bench Press')).toBeVisible();
    });

    // Step 3: Complete sets for first exercise
    await test.step('Complete sets for Bench Press', async () => {
      // Complete Set 1
      await page.getByLabel('Reps').fill('10');
      await page.getByLabel(/weight/i).fill('135');
      await page.getByRole('button', { name: /complete set/i }).click();
      
      // Wait for toast and verify
      await expect(page.getByText(/set completed/i)).toBeVisible();
      
      // Complete Set 2
      await page.getByLabel('Reps').fill('10');
      await page.getByLabel(/weight/i).fill('135');
      await page.getByRole('button', { name: /complete set/i }).click();
      await expect(page.getByText(/set completed/i)).toBeVisible();
      
      // Complete Set 3
      await page.getByLabel('Reps').fill('8');
      await page.getByLabel(/weight/i).fill('135');
      await page.getByRole('button', { name: /complete set/i }).click();
      await expect(page.getByText(/set completed/i)).toBeVisible();
      
      // Verify all 3 sets are shown as completed
      await expect(page.getByText('Set 1')).toBeVisible();
      await expect(page.getByText('Set 2')).toBeVisible();
      await expect(page.getByText('Set 3')).toBeVisible();
    });

    // Step 4: Move to next exercise
    await test.step('Advance to Shoulder Press', async () => {
      // Next Exercise button should be enabled now
      const nextButton = page.getByRole('button', { name: /next exercise/i });
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      
      // Verify we're on the second exercise
      await expect(page.getByText('Shoulder Press')).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: 'Shoulder Press' })).toBeVisible();
    });

    // Step 5: Complete sets for second exercise
    await test.step('Complete sets for Shoulder Press', async () => {
      // Complete Set 1
      await page.getByLabel('Reps').fill('12');
      await page.getByLabel(/weight/i).fill('50');
      await page.getByRole('button', { name: /complete set/i }).click();
      await expect(page.getByText(/set completed/i)).toBeVisible();
      
      // Complete Set 2
      await page.getByLabel('Reps').fill('12');
      await page.getByLabel(/weight/i).fill('50');
      await page.getByRole('button', { name: /complete set/i }).click();
      await expect(page.getByText(/set completed/i)).toBeVisible();
      
      // Complete Set 3
      await page.getByLabel('Reps').fill('10');
      await page.getByLabel(/weight/i).fill('50');
      await page.getByRole('button', { name: /complete set/i }).click();
      await expect(page.getByText(/set completed/i)).toBeVisible();
    });

    // Step 6: Finish the workout
    await test.step('Finish the workout', async () => {
      // After last exercise, button should say "Finish Workout"
      const finishButton = page.getByRole('button', { name: /finish workout/i });
      await expect(finishButton).toBeEnabled();
      await finishButton.click();
      
      // Verify completion toast
      await expect(page.getByText(/workout completed/i)).toBeVisible();
      
      // Should return to workout selection screen
      await expect(page.getByRole('heading', { name: /start a workout/i })).toBeVisible();
    });

    // Step 7: Verify workout appears in progress history
    await test.step('Verify workout in progress history', async () => {
      // Navigate to Progress tab
      await page.getByRole('tab', { name: /progress/i }).click();
      
      // Verify stats updated
      await expect(page.getByText('Total Workouts')).toBeVisible();
      await expect(page.getByText('1')).toBeVisible(); // 1 total workout
      
      // Verify workout appears in history
      await expect(page.getByRole('heading', { name: 'Push Day Test' })).toBeVisible();
      await expect(page.getByText('Bench Press')).toBeVisible();
      await expect(page.getByText('Shoulder Press')).toBeVisible();
      
      // Verify set counts
      await expect(page.getByText('3 sets')).toBeVisible();
    });
  });

  test('navigate between exercises during workout', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Create a plan with multiple exercises first
    await page.getByRole('tab', { name: /plans/i }).click();
    await page.getByRole('button', { name: /new plan/i }).click();
    await page.getByLabel('Plan Name').fill('Navigation Test');
    await page.getByLabel('Description').fill('Test navigation');
    
    // Add two exercises
    await page.getByRole('button', { name: /add exercise/i }).click();
    await page.getByLabel('Sets').first().fill('2');
    await page.getByRole('button', { name: /add exercise/i }).click();
    await page.getByLabel('Sets').nth(1).fill('2');
    
    await page.getByRole('button', { name: /save plan/i }).click();
    
    // Start workout
    await page.getByRole('tab', { name: /^workout$/i }).click();
    await page.getByRole('button', { name: /start workout/i }).click();
    
    // Complete first set
    await page.getByLabel('Reps').fill('10');
    await page.getByRole('button', { name: /complete set/i }).click();
    await page.getByLabel('Reps').fill('10');
    await page.getByRole('button', { name: /complete set/i }).click();
    
    // Go to next exercise
    await page.getByRole('button', { name: /next exercise/i }).click();
    
    // Verify Previous button is now enabled
    const previousButton = page.getByRole('button', { name: /previous/i });
    await expect(previousButton).toBeEnabled();
    
    // Go back to first exercise
    await previousButton.click();
    
    // Verify we're back on the first exercise (completed sets should still be visible)
    await expect(page.getByText('Set 1')).toBeVisible();
    await expect(page.getByText('Set 2')).toBeVisible();
  });

  test('cannot advance without completing all sets', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Create and start a simple workout
    await page.getByRole('tab', { name: /plans/i }).click();
    await page.getByRole('button', { name: /new plan/i }).click();
    await page.getByLabel('Plan Name').fill('Incomplete Sets Test');
    await page.getByRole('button', { name: /add exercise/i }).click();
    await page.getByLabel('Sets').first().fill('3');
    await page.getByRole('button', { name: /save plan/i }).click();
    
    await page.getByRole('tab', { name: /^workout$/i }).click();
    await page.getByRole('button', { name: /start workout/i }).click();
    
    // Next button should be disabled initially
    const nextButton = page.getByRole('button', { name: /next exercise|finish workout/i });
    await expect(nextButton).toBeDisabled();
    
    // Complete only 1 set
    await page.getByLabel('Reps').fill('10');
    await page.getByRole('button', { name: /complete set/i }).click();
    
    // Should still be disabled
    await expect(nextButton).toBeDisabled();
    
    // Complete remaining sets
    await page.getByLabel('Reps').fill('10');
    await page.getByRole('button', { name: /complete set/i }).click();
    await page.getByLabel('Reps').fill('10');
    await page.getByRole('button', { name: /complete set/i }).click();
    
    // Now should be enabled
    await expect(nextButton).toBeEnabled();
  });
});
