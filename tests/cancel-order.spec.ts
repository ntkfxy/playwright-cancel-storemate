import { test, expect } from "@playwright/test";

test.setTimeout(120000);

test("TC-22001 ยกเลิกคำสั่งซื้อสถานะที่ต้องชำระสำเร็จ", async ({ page }) => {
  const ORDER_NO = "ORD-20261012042025774-8234";

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

    const cancelButtons = page.getByTestId("btn-cancel-order");

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
    cancelledOrder.getByText("ยกเลิกคำสั่งซื้อ", {
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

test("TC-22002 ยกเลิกคำสั่งซื้อสถานะที่ต้องจัดส่งแบบชำระเงินปลายทางสำเร็จ", async ({
  page,
}) => {
  const ORDER_NO = "ORD-20261012042245518-6143";
  const CANCEL_REASON = "เปลี่ยนวิธีการชำระเงิน";

  // 1. เข้า Home
  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  // 2. เปิดเมนู Profile
  const profileButton = page.getByTestId("btn-user-profile");

  await expect(profileButton).toBeVisible({
    timeout: 15000,
  });

  await profileButton.click();

  // 3. เข้าเมนูการซื้อของฉัน
  const ordersButton = page.getByTestId("btn-orders");

  await expect(ordersButton).toBeVisible({
    timeout: 15000,
  });

  await ordersButton.click();

  // 4. ตรวจสอบหน้า Orders
  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // 5. เลือก Tab ที่ต้องจัดส่ง
  const shippingTab = page
    .locator("div")
    .filter({
      hasText: /^ที่ต้องจัดส่ง$/,
    })
    .first();

  await expect(shippingTab).toBeVisible({
    timeout: 15000,
  });

  await shippingTab.click();

  // 6. ตรวจสอบ URL ของ Tab
  await expect(page).toHaveURL(/status=PROCESSING/, {
    timeout: 15000,
  });

  // 7. ค้นหา Order ที่ต้องการทดสอบ
  const order = page.getByTestId(`card-order-${ORDER_NO}`);

  await expect(order).toBeVisible({
    timeout: 30000,
  });

  // 8. เปิดรายละเอียด Order
  await order.click();

  // 9. ค้นหา Order Card ของ Order ที่กำหนด
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 15000,
  });

  // 10. กดยกเลิก Order ที่ระบุเท่านั้น
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toBeVisible({
    timeout: 15000,
  });

  await cancelButton.click();

  // 11. ตรวจสอบหน้า Cancel Order
  await expect(page).toHaveURL(new RegExp(`/cancel-orders/${ORDER_NO}$`), {
    timeout: 15000,
  });

  // 12. เปิด Dropdown เหตุผล
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  await reasonDropdown.click();

  // 13. เลือกเหตุผลการยกเลิก
  const reasonOption = page.getByTestId("reason-option-change_payment_method");

  await expect(reasonOption).toBeVisible({
    timeout: 15000,
  });

  await reasonOption.click();

  // 14. ตรวจสอบเหตุผลที่เลือก
  await expect(reasonDropdown).toContainText(CANCEL_REASON);

  // 15. ยืนยันการยกเลิก
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  // 16. ตรวจสอบข้อความแจ้งเตือน
  const successMessage = page.getByText("ส่งคำขอยกเลิกสำเร็จ", {
    exact: true,
  });

  await expect(successMessage).toBeVisible({
    timeout: 15000,
  });

  // 17. ไป Tab ยกเลิก
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

  // 18. ตรวจสอบ URL
  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // 19. ตรวจสอบว่า Order ย้ายมาอยู่ใน Tab ยกเลิก
  const cancelledOrder = page.getByTestId(`card-order-${ORDER_NO}`);

  await expect(cancelledOrder).toBeVisible({
    timeout: 30000,
  });

  // 20. ตรวจสอบสถานะของ Order ที่ถูกยกเลิก
  await expect(cancelledOrder).toContainText("ยกเลิกคำสั่งซื้อ", {
    timeout: 15000,
  });

  // 21. ตรวจสอบเหตุผลการยกเลิก
  await expect(cancelledOrder).toContainText(CANCEL_REASON, {
    timeout: 15000,
  });
});

test("TC-22003 ตรวจสอบข้อความแจ้งเตือนเมื่อยกเลิกคำสั่งซื้อสำเร็จ", async ({
  page,
}) => {
  const ORDER_NO = "ORD-20261012042011712-3437";

  // 1. เข้า Home
  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  // 2. เปิดเมนู Profile
  const profileButton = page.getByTestId("btn-user-profile");

  await expect(profileButton).toBeVisible({
    timeout: 15000,
  });

  await profileButton.click();

  // 3. เข้าเมนูการซื้อของฉัน
  const ordersButton = page.getByTestId("btn-orders");

  await expect(ordersButton).toBeVisible({
    timeout: 15000,
  });

  await ordersButton.click();

  // 4. ตรวจสอบว่าเข้าสู่หน้า Orders
  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // 5. เลือก Tab ที่มี Order อยู่
  // ใช้ Tab ที่ต้องชำระตามเงื่อนไขเดิมของ Test Case
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

  // 6. ตรวจสอบ URL ของ Tab
  // หมายเหตุ: ต้องยืนยันว่า status=PROCESSING ตรงกับ Tab นี้จริง
  await expect(page).toHaveURL(/status=PROCESSING/, {
    timeout: 15000,
  });

  // 7. ค้นหา Order ที่ต้องการทดสอบ
  const order = page.getByTestId(`card-order-${ORDER_NO}`);

  await expect(order).toBeVisible({
    timeout: 30000,
  });

  // 8. เปิดรายละเอียด Order
  await order.click();

  // 9. ค้นหา Order Card ของ Order หมายเลขที่กำหนด
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 15000,
  });

  // 10. กดยกเลิก Order ที่ระบุเท่านั้น
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toBeVisible({
    timeout: 15000,
  });

  await cancelButton.click();

  // 11. ตรวจสอบหน้า Cancel Order
  await expect(page).toHaveURL(new RegExp(`/cancel-orders/${ORDER_NO}$`), {
    timeout: 15000,
  });

  // 12. เปิด Dropdown เหตุผล
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  await reasonDropdown.click();

  // 13. เลือกเหตุผลการยกเลิก
  const reasonOption = page.getByTestId("reason-option-change_payment_method");

  await expect(reasonOption).toBeVisible({
    timeout: 15000,
  });

  await reasonOption.click();

  // 14. ตรวจสอบว่าเลือกเหตุผลถูกต้อง
  await expect(reasonDropdown).toContainText("เปลี่ยนวิธีการชำระเงิน");

  // 15. ยืนยันการยกเลิก
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  // 16. ตรวจสอบข้อความแจ้งเตือนตามวัตถุประสงค์ TC-22003
  const successMessage = page.getByText("ส่งคำขอยกเลิกสำเร็จ", {
    exact: true,
  });

  await expect(successMessage).toBeVisible({
    timeout: 15000,
  });
});

test("TC-22004 ตรวจสอบเหตุผลการยกเลิกคำสั่งซื้อ", async ({ page }) => {
  const ORDER_NO = "ORD-20260917171713676-4546";
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
    orderCard.getByText("ยกเลิกคำสั่งซื้อ", {
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

test("TC-22005 ตรวจสอบคำสั่งซื้อหลังยกเลิกอยู่ในแถบยกเลิก", async ({
  page,
}) => {
  const ORDER_NO = "ORD-20261012041546209-3421";

  // 1. เปิดหน้า My Purchases
  await page.goto("/orders?status=ALL");

  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // 2. ค้นหา Tab ยกเลิก
  const cancelledTab = page
    .getByText("ยกเลิก", {
      exact: true,
    })
    .first();

  await expect(cancelledTab).toBeVisible({
    timeout: 15000,
  });

  // 3. คลิก Tab ยกเลิก
  await cancelledTab.click();

  // 4. ตรวจสอบ URL
  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // 5. ตรวจสอบว่า Order อยู่ใน Tab ยกเลิก
  const cancelledOrder = page.getByTestId(/^order-card-/).filter({
    hasText: ORDER_NO,
  });

  await expect(cancelledOrder).toBeVisible({
    timeout: 30000,
  });

  // 6. ตรวจสอบสถานะ Order
  await expect(cancelledOrder).toContainText("ยกเลิกคำสั่งซื้อ", {
    timeout: 15000,
  });

  // 7. กลับไป Tab สถานะเดิม: ที่ต้องจัดส่ง
  // ใช้ได้เมื่อ Order นี้เดิมอยู่ในสถานะ PROCESSING
  await page.goto("/orders?status=PROCESSING");

  await expect(page).toHaveURL(/status=PROCESSING/, {
    timeout: 15000,
  });

  // 8. ตรวจสอบว่า Order ไม่อยู่ใน Tab สถานะเดิม
  const previousStatusOrder = page.getByTestId(/^order-card-/).filter({
    hasText: ORDER_NO,
  });

  await expect(previousStatusOrder).toHaveCount(0, {
    timeout: 15000,
  });
});

test("TC-22006 ไม่สามารถยกเลิกคำสั่งซื้อโดยไม่เลือกเหตุผล", async ({
  page,
}) => {
  const ORDER_NO = "ORD-20261012041940881-6454";

  // 1. เข้า Home
  await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  // 2. เปิดเมนู Profile
  const profileButton = page.getByTestId("btn-user-profile");

  await expect(profileButton).toBeVisible({
    timeout: 15000,
  });

  await profileButton.click();

  // 3. เข้าเมนูการซื้อของฉัน
  const ordersButton = page.getByTestId("btn-orders");

  await expect(ordersButton).toBeVisible({
    timeout: 15000,
  });

  await ordersButton.click();

  // 4. ตรวจสอบหน้า Orders
  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // 5. เลือก Tab ที่ต้องชำระ
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

  // 6. ตรวจสอบ URL
  await expect(page).toHaveURL(/status=PENDING/, {
    timeout: 15000,
  });

  // 7. ค้นหา Order
  const order = page.getByTestId(`card-order-${ORDER_NO}`);

  await expect(order).toBeVisible({
    timeout: 30000,
  });

  // 8. เปิดรายละเอียด Order
  await order.click();

  // 9. ค้นหา Order Card ที่ตรงกับ Order No.
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 15000,
  });

  // 10. กดปุ่มยกเลิก
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toBeVisible({
    timeout: 15000,
  });

  await cancelButton.click();

  // 11. ตรวจสอบหน้า Cancel Order
  await expect(page).toHaveURL(new RegExp(`/cancel-orders/${ORDER_NO}$`), {
    timeout: 15000,
  });

  // 12. ตรวจสอบ Dropdown เหตุผล โดยไม่เลือกเหตุผล
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  // 13. กด Submit โดยไม่เลือกเหตุผล
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await submitButton.click();

  // 14. ตรวจสอบข้อความ Validation
  const validationMessage = page.getByText(
    "กรุณาเลือกเหตุผลในการยกเลิกคำสั่งซื้อ",
    {
      exact: true,
    },
  );

  await expect(validationMessage).toBeVisible({
    timeout: 15000,
  });

  // 15. ยืนยันว่าไม่ออกจากหน้า Cancel
  await expect(page).toHaveURL(new RegExp(`/cancel-orders/${ORDER_NO}$`));

  // 16. ตรวจสอบว่าไม่มีข้อความแจ้งยกเลิกสำเร็จ
  await expect(
    page.getByText("ส่งคำขอยกเลิกสำเร็จ", {
      exact: true,
    }),
  ).toHaveCount(0);

  // 17. กลับไปตรวจสอบสถานะ Order
  await page.goto("/orders?status=PENDING");

  await expect(page).toHaveURL(/status=PENDING/, {
    timeout: 15000,
  });

  // 18. ยืนยันว่า Order ยังอยู่ในสถานะรอชำระ
  const unchangedOrder = page.getByTestId(`card-order-${ORDER_NO}`);

  await expect(unchangedOrder).toBeVisible({
    timeout: 30000,
  });
});

test("TC-22007 ยกเลิกคำสั่งซื้อโดยระบุรายละเอียดเพิ่มเติม", async ({
  page,
}) => {
  const ORDER_NO = "ORD-20261012041908330-9130";
  const CANCEL_REASON = "เปลี่ยนวิธีการชำระเงิน";
  const CANCEL_DETAIL = "ไม่ต้องการสินค้าแล้ว";

  // 1. เปิดหน้า Orders
  await page.goto("/orders?status=ALL");

  await expect(page).toHaveURL(/\/orders/, {
    timeout: 15000,
  });

  // 2. ค้นหา Order ที่ต้องการทดสอบ
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 30000,
  });

  // 3. กดยกเลิก Order
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toBeVisible({
    timeout: 15000,
  });

  await cancelButton.click();

  // 4. ตรวจสอบหน้า Cancel Order
  await expect(page).toHaveURL(new RegExp(`/cancel-orders/${ORDER_NO}$`), {
    timeout: 15000,
  });

  // 5. เปิด Dropdown เหตุผล
  const reasonDropdown = page.getByTestId("dropdown-reason");

  await expect(reasonDropdown).toBeVisible({
    timeout: 15000,
  });

  await reasonDropdown.click();

  // 6. เลือกเหตุผลการยกเลิก
  const reasonOption = page.getByTestId("reason-option-change_payment_method");

  await expect(reasonOption).toBeVisible({
    timeout: 15000,
  });

  await reasonOption.click();

  // 7. ตรวจสอบเหตุผลที่เลือก
  await expect(reasonDropdown).toContainText(CANCEL_REASON);

  // 8. กรอกรายละเอียดเพิ่มเติม
  const detailInput = page.getByTestId("input-description");

  await expect(detailInput).toBeVisible({
    timeout: 15000,
  });

  await detailInput.fill(CANCEL_DETAIL);

  // 9. ตรวจสอบค่าก่อนส่งคำขอ
  await expect(detailInput).toHaveValue(CANCEL_DETAIL);

  // 10. ยืนยันการยกเลิก
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  // 11. ตรวจสอบข้อความแจ้งเตือนสำเร็จ
  await expect(
    page.getByText("ส่งคำขอยกเลิกสำเร็จ", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });

  // 12. เปิดหน้า Orders อีกครั้ง
  await page.goto("/orders?status=CANCELLED");

  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // 13. ค้นหา Order ที่ถูกยกเลิก
  const cancelledOrder = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(cancelledOrder).toBeVisible({
    timeout: 30000,
  });

  // 14. ตรวจสอบสถานะคำสั่งซื้อ
  await expect(cancelledOrder).toContainText("ยกเลิกแล้ว", {
    timeout: 15000,
  });

  // 15. ตรวจสอบเหตุผลการยกเลิก
  await expect(cancelledOrder).toContainText(CANCEL_REASON, {
    timeout: 15000,
  });

  // 16. ตรวจสอบรายละเอียดเพิ่มเติมที่บันทึกไว้
  // ต้องมีการแสดงรายละเอียดนี้ใน Order Card จึงจะตรวจด้วยวิธีนี้ได้
  await expect(cancelledOrder).toContainText(CANCEL_DETAIL, {
    timeout: 15000,
  });
});

test("TC-22008 ไม่สามารถยกเลิกคำสั่งซื้อที่ไม่อยู่ในสถานะที่อนุญาต", async ({
  page,
}) => {
  const ORDER_NO = "ORD-20260918191320940-8506";

  // 1. เปิดหน้า Orders สถานะที่ต้องได้รับ
  await page.goto("/orders?status=RECEIVED");

  await expect(page).toHaveURL(/\/orders\?status=RECEIVED/, {
    timeout: 15000,
  });

  // 2. ค้นหา Order ที่ต้องการทดสอบ
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  await expect(orderCard).toBeVisible({
    timeout: 30000,
  });

  // 3. ตรวจสอบสถานะเดิมของ Order
  await expect(
    orderCard.getByText("ที่ต้องได้รับ", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });

  // 4. ตรวจสอบว่าไม่มีปุ่มยกเลิกใน Order นี้
  const cancelButton = orderCard.getByTestId("btn-cancel-order");

  await expect(cancelButton).toHaveCount(0);

  // 5. ตรวจสอบว่าไม่มีปุ่มยกเลิกที่ใช้งานได้ในหน้า
  await expect(page.getByTestId("btn-cancel-order")).toHaveCount(0);

  // 6. ตรวจสอบว่ายังอยู่หน้า Orders สถานะเดิม
  await expect(page).toHaveURL(/status=RECEIVED/, {
    timeout: 15000,
  });

  // 7. ตรวจสอบว่า Order ยังคงมีสถานะที่ต้องได้รับ
  await expect(
    orderCard.getByText("ที่ต้องได้รับ", {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 15000,
  });
});

test("TC-22009 ยกเลิกกระบวนการโดยไม่ยืนยันคำขอ", async ({ page }) => {
  const ORDER_NO = "ORD-20261012041826716-6061";

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
  // 7. ค้นหาคำสั่งซื้อที่ต้องการทดสอบ
  // ==========================================
  const order = page.locator(`[data-test="card-order-${ORDER_NO}"]`);

  await expect(order).toBeVisible({
    timeout: 30000,
  });

  console.log(`พบ Order: ${ORDER_NO}`);

  // ==========================================
  // 8. เปิดรายละเอียดคำสั่งซื้อ
  // ==========================================
  await order.click();

  // ==========================================
  // 9. ค้นหาปุ่มยกเลิกคำสั่งซื้อ
  // ==========================================
  const orderCard = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: ORDER_NO,
    })
    .first();

  if ((await orderCard.count()) > 0) {
    const cancelButton = orderCard.getByTestId("btn-cancel-order");

    await expect(cancelButton).toBeVisible({
      timeout: 15000,
    });

    await cancelButton.click();
  } else {
    // ==========================================
    // 10. Fallback กรณีไม่พบ Order Card
    // ==========================================
    const cancelButtons = page.getByTestId("btn-cancel-order");

    if ((await cancelButtons.count()) === 1) {
      await expect(cancelButtons.first()).toBeVisible({
        timeout: 15000,
      });

      await cancelButtons.first().click();
    } else {
      throw new Error(`ไม่สามารถระบุปุ่ม Cancel ของ Order ${ORDER_NO} ได้`);
    }
  }

  // ==========================================
  // 11. ตรวจสอบหน้า Cancel Order
  // ==========================================
  await expect(page).toHaveURL(`/cancel-orders/${ORDER_NO}`, {
    timeout: 15000,
  });

  // ==========================================
  // 12. ตรวจสอบปุ่มยืนยันการส่งคำขอ
  // ==========================================
  const submitButton = page.getByTestId("btn-submit-cancel");

  await expect(submitButton).toBeVisible({
    timeout: 15000,
  });

  // ==========================================
  // 13. กดย้อนกลับโดยไม่ยืนยัน
  // ==========================================
  // ไม่กด submitButton.click()
  await page.goBack();

  // ==========================================
  // 14. ตรวจสอบว่าออกจากหน้า Cancel แล้ว
  // ==========================================
  await expect(page).not.toHaveURL(`/cancel-orders/${ORDER_NO}`, {
    timeout: 15000,
  });

  console.log("ออกจากหน้าการยกเลิกโดยไม่กดยืนยัน");

  // ==========================================
  // 15. กลับไปหน้า Orders
  // ==========================================
  await page.goto("/orders?status=PENDING", {
    waitUntil: "domcontentloaded",
  });

  // ==========================================
  // 16. ตรวจสอบ URL
  // ==========================================
  await expect(page).toHaveURL(/status=PENDING/, {
    timeout: 15000,
  });

  // ==========================================
  // 17. ตรวจสอบว่า Order ยังอยู่ในสถานะเดิม
  // ==========================================
  const originalOrder = page.locator(`[data-test="card-order-${ORDER_NO}"]`);

  await expect(originalOrder).toBeVisible({
    timeout: 30000,
  });

  console.log(`Order ${ORDER_NO} ยังคงอยู่ในสถานะ PENDING`);

  // ==========================================
  // 18. ตรวจสอบว่า Order ไม่อยู่ใน Tab ยกเลิก
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
  // 19. ตรวจสอบ URL ของ Tab ยกเลิก
  // ==========================================
  await expect(page).toHaveURL(/status=CANCELLED/, {
    timeout: 15000,
  });

  // ==========================================
  // 20. ตรวจสอบว่า Order ไม่ถูกยกเลิก
  // ==========================================
  const cancelledOrder = page.locator(`[data-test="card-order-${ORDER_NO}"]`);

  await expect(cancelledOrder).toHaveCount(0, {
    timeout: 15000,
  });

  console.log(
    `TC-22009 PASS: Order ${ORDER_NO} ไม่ถูกยกเลิก และยังคงสถานะเดิม`,
  );
});
