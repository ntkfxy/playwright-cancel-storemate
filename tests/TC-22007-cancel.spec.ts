import { test, expect } from "@playwright/test";
test.setTimeout(60000);

const ORDER_NO = "ORD-20260818211305016-5082";

test("TC-22007 ยกเลิกคำสั่งซื้อโดยระบุรายละเอียดเพิ่มเติม", async ({
  page,
}) => {
  // ==========================================
  // 1. เปิด Orders
  // ==========================================
  await page.goto("/orders?status=ALL");

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

  // ==========================================
  // 3. กดยกเลิก
  // ==========================================
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toBeVisible({
    timeout: 15000,
  });

  await cancelButton.click();

  // ==========================================
  // 4. ตรวจสอบ URL
  // ==========================================
  await expect(page).toHaveURL(`/cancel-orders/${ORDER_NO}`, {
    timeout: 15000,
  });

  // ==========================================
  // 5. เปิด Dropdown Reason
  // ==========================================
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  await reasonDropdown.click();

  // ==========================================
  // 6. เลือก "เปลี่ยนใจ"
  // ==========================================
  const reasonOption = page.getByTestId("reason-option-change_payment_method");

  await expect(reasonOption).toBeVisible({
    timeout: 15000,
  });

  await reasonOption.click();

  // ==========================================
  // 7. ตรวจสอบ Reason
  // ==========================================
  await expect(reasonDropdown).toContainText("เปลี่ยนวิธีการชำระเงิน");

  // ==========================================
  // 8. กรอกรายละเอียดเพิ่มเติม
  // ==========================================
  const detailInput = page.getByTestId("input-description");

  await expect(detailInput).toBeVisible({
    timeout: 15000,
  });

  await detailInput.fill("ไม่ต้องการสินค้าแล้ว");

  // ==========================================
  // 9. ตรวจสอบข้อมูลที่กรอก
  // ==========================================
  await expect(detailInput).toHaveValue("ไม่ต้องการสินค้าแล้ว");

  // ==========================================
  // 10. Submit
  // ==========================================
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await submitButton.click();

  // ==========================================
  // 11. Success
  // ==========================================
  await expect(page.getByText("ส่งคำขอยกเลิกสำเร็จ")).toBeVisible({
    timeout: 15000,
  });

  console.log("ส่งคำขอยกเลิกสำเร็จ");

  // ==========================================
  // 12. ตรวจสอบ Order กลับมาหน้า Orders
  // ==========================================
  await page.goto("/orders");

  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // ==========================================
  // 13. ไป Tab Cancelled
  // ==========================================
  const cancelledTab = page
    .getByText("ยกเลิก", {
      exact: true,
    })
    .first();

  await expect(cancelledTab).toBeVisible({
    timeout: 15000,
  });

  await cancelledTab.click();

  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // ==========================================
  // 14. ตรวจสอบ Order
  // ==========================================
  const cancelledOrder = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(cancelledOrder).toBeVisible({
    timeout: 30000,
  });

  // ==========================================
  // 15. ตรวจสอบสถานะ
  // ==========================================
  await expect(
    cancelledOrder.getByText("ยกเลิกแล้ว", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });
});
