---
name: Page Object Rules
description: Conventions for files in the pages directory.
applyTo: "pages/**/*.ts"
---

- Define selectors as `readonly Locator` properties on the page object class.
- Use behavior-oriented helper names such as `sortByNameDescending` or `expectCartBadgeCount`
- Keep selectors and page-specific assertions centralized in the page object.