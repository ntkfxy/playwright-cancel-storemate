import { test, expect } from "@playwright/test";

test.setTimeout(120000);

test("TC-22001 ยกเลิกคำสั่งซื้อสถานะที่ต้องชำระสำเร็จ", async ({ page }) => {
  const ORDER_NO = "ORD-20260818202151279-4432";

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
  // 7. รอ Order Card โหลด
  // ==========================================
  const order = page.locator(`[data-test="card-order-${ORDER_NO}"]`);

  await expect(order).toBeVisible({
    timeout: 30000,
  });

  console.log(`พบ Order: ${ORDER_NO}`);

  // ==========================================
  // 8. Debug HTML ของ Order
  // ==========================================
  console.log(
    "ORDER HTML:",
    await order.evaluate((element) => element.outerHTML),
  );

  // ==========================================
  // 9. เปิดรายละเอียด Order
  // ==========================================
  await order.click();

  // รอเล็กน้อยให้ UI render
  await page.waitForTimeout(500);

  // ==========================================
  // 10. หา Order Card ที่มีปุ่ม Cancel
  // ==========================================
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  // ==========================================
  // 11. ถ้า Order Card ถูกหาเจอ
  // ==========================================
  if ((await orderCard.count()) > 0) {
    console.log("พบ order-card ที่ตรงกับ Order No.");

    const cancelButton = orderCard.getByTestId("btn-cancel-order");

    await expect(cancelButton).toBeVisible({
      timeout: 15000,
    });

    await cancelButton.click();
  } else {
    // ==========================================
    // 12. Fallback
    // ==========================================
    console.log("ไม่พบ order-card จาก Order No. กำลังตรวจสอบปุ่ม Cancel");

    const cancelButtons = page.getByTestId("btn-cancel-order");

    console.log("จำนวนปุ่ม Cancel:", await cancelButtons.count());

    // ถ้ามีปุ่มเดียว
    if ((await cancelButtons.count()) === 1) {
      await expect(cancelButtons.first()).toBeVisible({
        timeout: 10000,
      });

      await cancelButtons.first().click();
    } else {
      throw new Error(`ไม่สามารถระบุปุ่ม Cancel ของ Order ${ORDER_NO} ได้`);
    }
  }

  // ==========================================
  // 13. ตรวจสอบหน้า Cancel Order
  // ==========================================
  await expect(page).toHaveURL(`/cancel-orders/${ORDER_NO}`, {
    timeout: 15000,
  });

  // ==========================================
  // 14. เปิด Dropdown เหตุผล
  // ==========================================
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  await reasonDropdown.click();

  // ==========================================
  // 15. เลือกเหตุผล
  // ==========================================
  const reasonOption = page.getByTestId("reason-option-change_payment_method");

  await expect(reasonOption).toBeVisible({
    timeout: 15000,
  });

  await reasonOption.click();

  // ==========================================
  // 16. ตรวจสอบว่าเลือกเหตุผลแล้ว
  // ==========================================
  await expect(reasonDropdown).toContainText("เปลี่ยนวิธีการชำระเงิน");

  // ==========================================
  // 17. กดยืนยันการยกเลิก
  // ==========================================
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await submitButton.click();
  // ==========================================
  // 18. ตรวจสอบส่งคำขอยกเลิกสำเร็จ
  // ==========================================
  await expect(page.getByText("ส่งคำขอยกเลิกสำเร็จ")).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 19. ไป Tab "ยกเลิก"
  // ==========================================
  const cancelledTab = page
    .locator("div")
    .filter({
      hasText: /^ยกเลิก$/,
    })
    .first();

  await expect(cancelledTab).toBeVisible({
    timeout: 15000,
  });

  await cancelledTab.click();

  // ==========================================
  // 20. ตรวจสอบ URL
  // ==========================================
  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // ==========================================
  // 21. หา Order ใน Tab "ยกเลิก"
  // ==========================================
  const cancelledOrder = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  // ==========================================
  // 22. ตรวจสอบว่า Order มีอยู่ใน DOM
  // ==========================================
  await expect(cancelledOrder).toBeAttached({
    timeout: 30000,
  });

  // ==========================================
  // 23. Scroll ไปยัง Order
  // ==========================================
  await cancelledOrder.scrollIntoViewIfNeeded();

  // ==========================================
  // 24. ตรวจสอบว่า Order มองเห็น
  // ==========================================
  await expect(cancelledOrder).toBeVisible({
    timeout: 15000,
  });

  console.log(`พบ Order ${ORDER_NO} ใน Tab ยกเลิก`);

  // ==========================================
  // 25. ตรวจสอบสถานะ
  // ==========================================
  await expect(
    cancelledOrder.getByText("ยกเลิกแล้ว", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 26. ตรวจสอบเหตุผลในการยกเลิก
  // ==========================================
  await expect(cancelledOrder).toContainText("เปลี่ยนวิธีการชำระเงิน", {
    timeout: 15000,
  });
});
