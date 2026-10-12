# StoreMate UC-22 — Playwright (TC-22001 ถึง TC-22009)

ปรับตามเอกสาร `สำเนาของ SPRS-Test-Cases.docx` และโครงสร้าง repository `ntkfxy/test-order-cancel-storemate` โดย **ยังไม่ได้รันทดสอบกับเว็บไซต์จริง**

## ติดตั้งและรัน

```bash
npm install
npx playwright install chromium
```

PowerShell:
```powershell
$env:STOREMATE_EMAIL='your-test-email'
$env:STOREMATE_PASSWORD='your-test-password'
npx playwright test --project=chromium
```

Windows cmd:
```cmd
set STOREMATE_EMAIL=your-test-email
set STOREMATE_PASSWORD=your-test-password
npx playwright test --project=chromium
```

ทดสอบเฉพาะกรณี: `npx playwright test tests/TC-22006-cancel.spec.ts --project=chromium`

## Test data

Test ที่ยกเลิกจริงจะเปลี่ยนข้อมูลถาวร **ต้องเตรียม Order ใหม่ก่อน rerun**:
- กำหนด environment variable ด้านล่างเป็น Order ที่มีอยู่และมีสถานะตรงตามกรณีทดสอบ เพื่อแทนที่ ID ตัวอย่างซึ่งอาจหมดอายุหรือไม่มีอยู่แล้ว
- `ORDER_PENDING`: TC-22001 — PENDING
- `ORDER_COD`: TC-22002 — PROCESSING + ชำระปลายทาง
- `ORDER_SUCCESS`: TC-22003 — PENDING ที่ยกเลิกได้
- `ORDER_CANCELLED`: TC-22004/05 — CANCELLED พร้อมเหตุผล; `ORDER_CANCELLED_PREVIOUS_STATUS` สถานะก่อนยกเลิก
- `ORDER_NO_REASON`: TC-22006 — PENDING
- `ORDER_DETAIL`: TC-22007 — PENDING
- `ORDER_FORBIDDEN`: TC-22008 — SHIPPING หรือสถานะที่ห้ามยกเลิก; `ORDER_FORBIDDEN_STATUS` กำหนดชื่อสถานะ URL ที่ระบบใช้จริง
- `ORDER_EXIT`: TC-22009 — ต้องกำหนดเองเป็น Order ใหม่ที่ยกเลิกได้; `ORDER_EXIT_STATUS` (default PENDING) กรณีนี้ไม่มี ID ตัวอย่าง

ตัวอย่าง PowerShell สำหรับรัน TC-22001 ด้วย Order ที่เตรียมไว้:
```powershell
$env:ORDER_PENDING='ORD-<your-pending-order>'
npx playwright test tests/TC-22001-cancel.spec.ts --project=chromium
```

## ข้อควรตรวจสอบก่อนใช้งาน

1. Order IDs ค่าเริ่มต้นนำมาจาก repository เดิม อาจถูกยกเลิกแล้ว/ไม่มีอยู่จริง
2. `getByTestId` อ้างอิง `data-test` ตาม repository เดิม; selectors ของหน้ารายละเอียดและแถบสถานะต้องตรวจสอบกับแอปจริง
3. TC-22007 ตรวจสอบการแสดงรายละเอียดที่บันทึกจริง หากหน้าเว็บไม่แสดงข้อความนี้ Test จะ fail เพื่อสะท้อนข้อกำหนด ไม่ใช่ข้าม assertion
4. TC-22002 เคยมีผลทดสอบจริงเป็นข้อผิดพลาดตามเอกสาร; ไม่ควรปรับ Expected Result เป็น error เพื่อทำให้ผ่าน
5. TC-22008 เอกสารระบุสถานะ 'กำลังจัดส่ง' แต่ repository เดิมใช้ RECEIVED จึงปรับให้ configurable
6. TC-22009 เพิ่มใหม่ตามเอกสาร
7. TC-22005 ต้องกำหนดสถานะเดิมของ order ให้ถูกต้อง
8. หาก UI ไม่แสดง reason บน card ให้ตรวจในรายละเอียด Order โดยไม่ลบ Expected Result

รันด้วย `npx playwright test --project=chromium` และดูรายงาน `npx playwright show-report`.
