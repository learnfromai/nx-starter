import { test, expect } from '@playwright/test';

test('Debug - Check what is rendered on page', async ({ page }) => {
  // Listen for console messages and errors
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot to see what's rendered
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  // Check the page content
  const pageContent = await page.content();
  console.log('Page HTML:', pageContent);
  
  // Check for various possible elements
  const appElement = await page.locator('[data-testid="todo-app"]').count();
  console.log('todo-app count:', appElement);
  
  const emptyStateElement = await page.locator('[data-testid="empty-state"]').count();
  console.log('empty-state count:', emptyStateElement);
  
  const loadingElement = await page.locator('[data-testid="loading-blank"]').count();
  console.log('loading-blank count:', loadingElement);
  
  // Check for any error messages
  const errorElements = await page.locator('[role="alert"]').count();
  console.log('error elements count:', errorElements);
  
  // Get all elements with data-testid
  const testIdElements = await page.locator('[data-testid]').all();
  console.log('Elements with data-testid:');
  for (const element of testIdElements) {
    const testId = await element.getAttribute('data-testid');
    const tagName = await element.evaluate(el => el.tagName);
    console.log(`- ${tagName}[data-testid="${testId}"]`);
  }
  
  // Check if the page has any content at all
  const bodyText = await page.locator('body').textContent();
  console.log('Body text content:', bodyText);
  
  // Wait a bit to see if anything loads
  await page.waitForTimeout(3000);
  
  const emptyStateAfterWait = await page.locator('[data-testid="empty-state"]').count();
  console.log('empty-state count after wait:', emptyStateAfterWait);
});