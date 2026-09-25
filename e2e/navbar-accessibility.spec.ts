import { expect, test } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 800 } as const;

test.describe("collapsed navbar accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("exposes a named, stateful menu control and keeps every item keyboard reachable", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Open navigation menu" });
    const menu = page.locator("#mobile-nav");

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeHidden();

    await trigger.focus();
    await trigger.press("Enter");

    await expect(trigger).toHaveAccessibleName("Close navigation menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("link", { name: "Features" })).toBeFocused();

    for (const label of ["Docs", "Pricing"]) {
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: label })).toBeFocused();
    }

    const lastLink = page.getByRole("link", { name: "Connect your Stellar wallet" });
    await lastLink.focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Features" })).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(lastLink).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
