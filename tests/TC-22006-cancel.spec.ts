import { test, expect } from "@playwright/test";

const ORDER_NO = "ORD-20260818211308477-4831";

test("TC-22006 ไม่สามารถยกเลิกคำสั่งซื้อโดยไม่เลือกเหตุผล", async ({
  page,
}) => {
  // ==========================================
  // 1. เข้า Home
  // ==========================================
  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  // ==========================================
  // 2. เปิดเมนู Profile
  // ==========================================
  const profileButton = page.getByTestId("btn-user-profile");

  await expect(profileButton).toBeVisible({
    timeout: 15000,
  });

  await profileButton.click();

  // ==========================================
  // 3. เข้า "การซื้อของฉัน"
  // ==========================================
  const ordersButton = page.getByTestId("btn-orders");

  await expect(ordersButton).toBeVisible({
    timeout: 15000,
  });

  await ordersButton.click();

  // ==========================================
  // 4. ตรวจสอบหน้า Orders
  // ==========================================
  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // ==========================================
  // 5. เลือก Tab "ที่ต้องชำระ"
  // ==========================================
  const pendingTab = page
    .locator("div")
    .filter({
      hasText: /^ที่ต้องชำระ$/,
    })
    .first();

  await expect(pendingTab).toBeVisible({
    timeout: 15000,
  });

  await pendingTab.click();

  // ==========================================
  // 6. ตรวจสอบ URL
  // ==========================================
  await expect(page).toHaveURL(/status=PENDING/, {
    timeout: 15000,
  });

  // ==========================================
  // 7. หา Order
  // ==========================================
  const order = page.locator(`[data-test="card-order-${ORDER_NO}"]`);

  await expect(order).toBeVisible({
    timeout: 30000,
  });

  console.log(`พบ Order: ${ORDER_NO}`);

  // ==========================================
  // 8. เปิดรายละเอียด Order
  // ==========================================
  await order.click();

  await page.waitForTimeout(500);

  // ==========================================
  // 9. หา Order Card
  // ==========================================
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 10. กดปุ่มยกเลิก
  // ==========================================
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toBeVisible({
    timeout: 15000,
  });

  await cancelButton.click();

  // ==========================================
  // 11. ตรวจสอบหน้า Cancel Order
  // ==========================================
  await expect(page).toHaveURL(`/cancel-orders/${ORDER_NO}`, {
    timeout: 15000,
  });

  // ==========================================
  // 12. เปิด Dropdown เหตุผล
  // แต่ไม่เลือกเหตุผล
  // ==========================================
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 13. กด Submit โดยไม่เลือกเหตุผล
  // ==========================================
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await submitButton.click();

  // ==========================================
  // 14. ตรวจสอบ Validation
  // ==========================================
  await expect(
    page.getByText("กรุณาเลือกเหตุผลในการยกเลิกคำสั่งซื้อ", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 15. ตรวจสอบว่ายังอยู่หน้า Cancel
  // ==========================================
  await expect(page).toHaveURL(`/cancel-orders/${ORDER_NO}`);
});
