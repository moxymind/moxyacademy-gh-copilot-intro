import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

test.describe('Inventory and Cart', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user');
  });

  test('add backback item to cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    
    await inventoryPage.expectLoaded();
    await inventoryPage.addBackpackToCart();
    
    // Validate the cart badge has updated
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.cartBadge).toBeVisible();
  });
});