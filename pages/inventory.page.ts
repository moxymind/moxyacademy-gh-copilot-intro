import { expect, type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly addToCartBackpackButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('.title');
    this.addToCartBackpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/.*inventory.html/);
    await expect(this.headerTitle).toHaveText('Products');
  }

  async addBackpackToCart() {
    await this.addToCartBackpackButton.click();
  }
}