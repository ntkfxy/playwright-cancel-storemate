import { test, expect } from '@playwright/test';

// test('ยกเลิกคำสั่งซื้อสำเร็จ', async ({ page }) => {

//   // เข้า Home โดยใช้ Session ที่ Login ไว้แล้ว
//   await page.goto('/');

//   // ตรวจสอบว่า User Login อยู่
//   const profileButton = page.getByTestId('btn-user-profile');

//   await expect(profileButton).toBeVisible();

//   // เปิดเมนู Profile
//   await profileButton.click();

//   // ตรวจสอบว่าปุ่ม "การซื้อของฉัน" แสดง
//   await expect(
//     page.getByTestId('btn-orders')
//   ).toBeVisible();

//   // เข้า My Purchases
//   await page.getByTestId('btn-orders').click();

//   // ตรวจสอบว่าไปหน้า Orders
//   await expect(page).toHaveURL('/orders?status=ALL');

// });


test('TC-22001 ยกเลิกคำสั่งซื้อสถานะที่ต้องชำระสำเร็จ', async ({ page }) => {

  // 1. เข้า Home
  await page.goto('/');

  // 2. เปิดเมนู Profile
  const profileButton = page.getByTestId('btn-user-profile');

  await expect(profileButton).toBeVisible();
  await profileButton.click();

  // 3. เข้า "การซื้อของฉัน"
  const ordersButton = page.getByTestId('btn-orders');

  await expect(ordersButton).toBeVisible();
  await ordersButton.click();

  // 4. ตรวจสอบว่าเข้าสู่หน้า Orders
  await expect(page).toHaveURL('/orders?status=ALL');

  // 5. เลือกแท็บ "ที่ต้องชำระ"
  const pendingTab = page.locator('div').filter({
    hasText: /^ที่ต้องชำระ$/,
  });

  await expect(pendingTab).toBeVisible();
  await pendingTab.click();

  // ตรวจสอบ URL
  await expect(page).toHaveURL(/status=PENDING/);

  console.log('URL หลังเลือก Tab:', page.url());

  // Debug ดูข้อมูลในหน้า
  console.log('PAGE TEXT:');
  console.log(
    (await page.locator('body').innerText()).slice(0, 5000)
  );

  // 6. ดูจำนวน Order
  const orderCards = page.getByTestId(/^order-card-/);

  console.log(
    'จำนวน Order Card:',
    await orderCards.count()
  );

  // Debug ข้อมูลแต่ละ Order
  const cards = await orderCards.all();

  for (const card of cards) {
    console.log('====================');
    console.log(
      'TEST ID:',
      await card.getAttribute('data-test')
    );
    console.log(
      await card.innerText()
    );
  }

  // รอข้อมูล Order
  await page.waitForTimeout(2000);

  // 7. เลือก Order ที่ต้องการ
  const order = page
    .getByTestId(/^order-card-/)
    .filter({
      hasText: 'ORD-20260719143141168-1111',
    });

  // ตรวจสอบว่าเจอ Order
  await expect(order).toHaveCount(1);
  await expect(order).toBeVisible();

  // 8. กดปุ่มยกเลิกเฉพาะ Order นี้
  await order
    .getByTestId('btn-cancel-order')
    .click();

  // 9. ตรวจสอบหน้า Cancel Order
  await expect(page).toHaveURL(
    '/cancel-orders/ORD-20260719143141168-1111'
  );

  // 10. เปิด Dropdown เหตุผล
  await page.getByTestId('dropdown-reason').click();

  // 11. เลือกเหตุผล
  await page
    .getByTestId('reason-option-no_longer_want')
    .first()
    .click();

  // 12. ยืนยันการยกเลิก
  await page.getByTestId('btn-submit-cancel').click();

  // 13. ตรวจสอบข้อความสำเร็จ
  await expect(
    page.getByText('ส่งคำขอยกเลิกสำเร็จ')
  ).toBeVisible();
});