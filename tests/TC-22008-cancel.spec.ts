import { test, expect } from "@playwright/test";

const ORDER_NO = "ORD-20260818194738198-6005";

test("TC-22008 ไม่สามารถยกเลิกคำสั่งซื้อที่ไม่อยู่ในสถานะที่อนุญาต", async ({
  page,
}) => {
  // ==========================================
  // 1. เปิด Orders
  // ==========================================
  await page.goto("orders?status=RECEIVED");

  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // ==========================================
  // 2. หา Order
  // ==========================================
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

  // ==========================================
  // 3. ตรวจสอบว่า Order อยู่ในสถานะที่ไม่อนุญาต
  // ==========================================
  await expect(
    orderCard.getByText("ที่ต้องได้รับ", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 4. ตรวจสอบว่าไม่มีปุ่ม Cancel
  // ==========================================
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).not.toBeVisible({
    timeout: 10000,
  });

  console.log("ไม่พบปุ่มยกเลิกคำสั่งซื้อ ซึ่งเป็นไปตาม Expected Result");

  // ==========================================
  // 5. ตรวจสอบว่าไม่สามารถเข้าสู่ Cancel Order
  // ==========================================
  await expect(page.getByTestId("btn-cancel-order")).not.toBeVisible({
    timeout: 10000,
  });
});
