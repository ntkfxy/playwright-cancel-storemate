import { test, expect } from "@playwright/test";

const ORDER_NO = "ORD-20260818194842521-4800";

test("TC-22005 ตรวจสอบคำสั่งซื้อหลังยกเลิกอยู่ในแถบยกเลิก", async ({
  page,
}) => {
  // ==========================================
  // 1. เปิดหน้า My Purchases
  // ==========================================
  await page.goto("/orders?status=ALL");

  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // ==========================================
  // 2. หา Tab "ยกเลิก"
  // ==========================================
  const cancelledTab = page
    .getByText("ยกเลิก", {
      exact: true,
    })
    .first();

  await expect(cancelledTab).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 3. คลิก Tab ยกเลิก
  // ==========================================
  await cancelledTab.click();

  // ==========================================
  // 4. ตรวจสอบ URL
  // ==========================================
  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // ==========================================
  // 5. หา Order ที่ถูกยกเลิก
  // ==========================================
  const cancelledOrder = page
    .getByTestId(/^order-card-/)
    .filter({ hasText: ORDER_NO });

  await expect(cancelledOrder).toBeVisible({
    timeout: 30000,
  });

  console.log(`พบ Order ${ORDER_NO} ใน Tab ยกเลิก`);

  // ==========================================
  // 6. ตรวจสอบสถานะ
  // ==========================================
  await expect(cancelledOrder).toContainText("ยกเลิกแล้ว", {
    timeout: 15000,
  });
});
