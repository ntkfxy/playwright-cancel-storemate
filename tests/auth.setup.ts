import { test as setup, expect } from "@playwright/test";

setup("เข้าสู่ระบบ", async ({ page }) => {
  await page.goto("/login");

  await page.locator('[data-test="email"]').fill("tototo123@gmail.com");

  await page.locator('[data-test="password"]').fill("Natthakan99");

  await page.locator('[data-test="btn-submit"]').click();

  await expect(page.getByTestId("btn-user-profile")).toBeVisible({
    timeout: 10000,
  });

  const cookies = await page.context().cookies();

  console.log("COOKIES:", cookies);

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});
