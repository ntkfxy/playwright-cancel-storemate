import { test, expect } from "@playwright/test";

const ORDER_NO = "ORD-20260818194842521-4800";

test("TC-22004 ตรวจสอบเหตุผลการยกเลิกคำสั่งซื้อ", async ({ page }) => {
  // 1. เปิดหน้า My Purchases
  await page.goto("/orders?status=ALL");

  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // 2. หา Order Card
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 30000,
  });

  console.log(`พบ Order: ${ORDER_NO}`);

  console.log("========== ORDER CARD ==========");
  console.log(await orderCard.innerText());
  console.log("================================");

  // 3. ตรวจสอบสถานะ
  await expect(
    orderCard.getByText("ยกเลิกแล้ว", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });

  // 4. ตรวจสอบเหตุผล
  await expect(orderCard).toContainText("เปลี่ยนวิธีการชำระเงิน", {
    timeout: 15000,
  });

  console.log("พบเหตุผล: เปลี่ยนวิธีการชำระเงิน");
});
