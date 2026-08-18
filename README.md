````markdown
# StoreMate - Playwright E2E Automated Testing

End-to-End (E2E) Automated Testing สำหรับระบบ **StoreMate** ด้วย **Playwright**  
โปรเจกต์นี้ใช้สำหรับทดสอบการทำงานของระบบผ่าน Web Application จริง โดยเน้นการทดสอบฟังก์ชัน **Order Cancellation**

---

## 📌 Project Overview

โปรเจกต์นี้จัดทำขึ้นเพื่อพัฒนา Automated Testing สำหรับ StoreMate โดยใช้ Playwright ในการจำลองการใช้งานของผู้ใช้งานจริง ตั้งแต่การเข้าสู่ระบบ การเข้าหน้าการซื้อของฉัน การค้นหา Order การยกเลิกคำสั่งซื้อ ไปจนถึงการตรวจสอบผลลัพธ์หลังการยกเลิก

---

## 🧪 Test Coverage

### Order Cancellation

| Test Case | Description                                         | Type     |
| --------- | --------------------------------------------------- | -------- |
| TC-22001  | ยกเลิกคำสั่งซื้อสถานะที่ต้องชำระสำเร็จ              | Positive |
| TC-22002  | ทดสอบการยกเลิกคำสั่งซื้อ                            | Positive |
| TC-22005  | ตรวจสอบคำสั่งซื้อหลังยกเลิกอยู่ในแถบยกเลิก          | Positive |
| TC-22006  | ไม่สามารถยกเลิกคำสั่งซื้อโดยไม่เลือกเหตุผล          | Negative |
| TC-22007  | ยกเลิกคำสั่งซื้อโดยระบุรายละเอียดเพิ่มเติม          | Positive |
| TC-22008  | ไม่สามารถยกเลิกคำสั่งซื้อที่ไม่อยู่ในสถานะที่อนุญาต | Negative |

> หมายเหตุ: รายการ Test Case สามารถเพิ่มได้ใน Version ถัดไป

---

# ⚙️ Requirements

ก่อนติดตั้งโปรเจกต์ ต้องติดตั้ง Software ดังต่อไปนี้

- Node.js LTS
- npm
- Git
- Google Chrome หรือ Chromium

ตรวจสอบ Version:

```bash
node -v
npm -v
git --version
```
````

แนะนำ:

```text
Node.js: LTS
npm: Latest compatible version
```

---

# 📥 Installation

## 1. Clone Repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

เข้าสู่ Project:

```bash
cd <PROJECT_FOLDER>
```

---

## 2. Install Dependencies

ติดตั้ง Dependencies จาก `package-lock.json`

```bash
npm ci
```

หรือสามารถใช้:

```bash
npm install
```

---

## 3. Install Playwright Browsers

ติดตั้ง Browser ที่ Playwright ต้องใช้:

```bash
npx playwright install
```

สำหรับ Linux / CI Environment:

```bash
npx playwright install --with-deps
```

---

# 🔐 Authentication Setup

โปรเจกต์ใช้ Playwright `storageState` สำหรับจัดเก็บ Authentication Session

ใน `playwright.config.ts`:

```ts
projects: [
  {
    name: "setup",
    testMatch: /.*\.setup\.ts/,
  },

  {
    name: "chromium",

    use: {
      ...devices["Desktop Chrome"],
      storageState: "playwright/.auth/user.json",
    },

    dependencies: ["setup"],
  },
],
```

ไฟล์ Authentication:

```text
playwright/
└── .auth/
    └── user.json
```

โดยไฟล์ `user.json` จะถูกใช้เพื่อให้ Test สามารถเข้าสู่ระบบโดยไม่ต้อง Login ใหม่ในทุก Test

> ⚠️ ไม่ควร Commit Credential หรือข้อมูล Authentication ที่เป็นความลับขึ้น Repository

---

# ⚙️ Playwright Configuration

ตัวอย่าง Configuration:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  fullyParallel: true,

  reporter: "html",

  use: {
    baseURL: "https://storemate-final.vercel.app/",
    testIdAttribute: "data-test",

    trace: "on-first-retry",
    screenshot: "on",
    video: "on",

    launchOptions: {
      slowMo: 1000,
    },
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },

      dependencies: ["setup"],
    },
  ],
});
```

### Configuration ที่สำคัญ

| Configuration      | Description                  |
| ------------------ | ---------------------------- |
| `testDir`          | ตำแหน่งของ Test Files        |
| `baseURL`          | URL ของ StoreMate            |
| `testIdAttribute`  | Attribute ที่ใช้ระบุ Element |
| `screenshot: "on"` | บันทึก Screenshot ทุก Test   |
| `video: "on"`      | บันทึก Video ทุก Test        |
| `trace`            | เก็บ Trace เมื่อมี Retry     |
| `reporter: "html"` | สร้าง HTML Test Report       |
| `storageState`     | ใช้ Authentication Session   |
| `slowMo`           | หน่วงการทำงานของ Browser     |

---

# ▶️ Running Tests

## Run All Tests

```bash
npx playwright test
```

---

## Run Test แบบ Headed

เปิด Browser ให้เห็นการทำงาน:

```bash
npx playwright test --headed
```

---

## Run Specific Test

ตัวอย่าง:

```bash
npx playwright test tests/TC-22001-cancel.spec.ts
```

---

## Run Multiple Tests

```bash
npx playwright test tests/TC-22001-cancel.spec.ts tests/TC-22002-cancel.spec.ts
```

---

## Run แบบ Headed และรันทีละ Worker

เหมาะสำหรับ Test ที่มีการเปลี่ยนสถานะ Order:

```bash
npx playwright test tests/TC-22001-cancel.spec.ts tests/TC-22002-cancel.spec.ts --headed --workers=1
```

---

# 📊 Playwright HTML Report

หลังจากรัน Test สามารถเปิด HTML Report ได้ด้วย:

```bash
npx playwright show-report
```

Report จะแสดง:

- Test Case
- Pass / Fail
- Test Duration
- Screenshot
- Video
- Trace
- Error Details

---

# 📸 Screenshot & 🎥 Video

โปรเจกต์ตั้งค่าให้บันทึก Screenshot และ Video ทุก Test:

```ts
screenshot: "on",
video: "on",
```

ผลลัพธ์จะถูกเก็บไว้ใน:

```text
test-results/
```

ตัวอย่าง:

```text
test-results/
├── TC-22001-cancel-xxxxx/
│   ├── video.webm
│   └── ...
│
└── TC-22002-cancel-xxxxx/
    ├── video.webm
    └── ...
```

---

# 🔄 GitHub Actions

โปรเจกต์มี GitHub Actions สำหรับรัน Playwright Test อัตโนมัติ

Workflow จะทำงานเมื่อ:

- Push ไปยัง `main`
- Push ไปยัง `master`
- Pull Request ไปยัง `main`
- Pull Request ไปยัง `master`

ตัวอย่าง Workflow:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master]

  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload Playwright Report
        if: ${{ always() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload Test Results
        if: ${{ always() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-test-results
          path: test-results/
          retention-days: 30
```

---

# 📦 GitHub Actions Artifacts

หลังจาก GitHub Actions ทำงานเสร็จ จะมี Artifacts:

```text
Artifacts
│
├── playwright-report
│   └── HTML Test Report
│
└── playwright-test-results
    ├── Screenshot
    ├── Video
    └── Trace
```

สามารถดาวน์โหลด Artifacts จากหน้า **GitHub Actions** เพื่อใช้ตรวจสอบผลการทดสอบได้

---

# 📁 Project Structure

```text
StoreMate-Playwright/
│
├── tests/
│   ├── TC-22001-cancel.spec.ts
│   ├── TC-22002-cancel.spec.ts
│   ├── TC-22005-cancel.spec.ts
│   ├── TC-22006-cancel.spec.ts
│   ├── TC-22007-cancel.spec.ts
│   ├── TC-22008-cancel.spec.ts
│   └── *.setup.ts
│
├── playwright/
│   └── .auth/
│       └── user.json
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── playwright.config.ts
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

# 🏷️ Version

## v1.0.0 — StoreMate Playwright E2E Testing

Initial version of Playwright E2E testing.

### Included

- Playwright setup
- Authentication setup
- Chromium Desktop testing
- Order Cancellation Test
- `TC-22001`
- Screenshot
- Video Recording
- HTML Test Report

---

## v1.1.0 — StoreMate Playwright E2E Order Cancellation

Current version.

### Added

- Multiple Order Cancellation Test Cases
- Positive Test Cases
- Negative Test Cases
- Order Status Validation
- Cancellation Reason Validation
- Additional Description Validation
- Cancellation Success Validation
- Cancelled Order Tab Validation
- Screenshot Recording
- Video Recording
- HTML Playwright Report
- GitHub Actions CI
- GitHub Actions Artifacts
- Automated Test Evidence Collection

### Test Cases

```text
TC-22001
TC-22002
TC-22005
TC-22006
TC-22007
TC-22008
```

---

# 📝 Version History

| Version  | Description                                     |
| -------- | ----------------------------------------------- |
| `v1.0.0` | Initial Playwright E2E Testing                  |
| `v1.1.0` | Expanded Order Cancellation Testing + CI/Report |

---

# 👨‍💻 Testing Technology

- **Playwright**
- **TypeScript**
- **Node.js**
- **npm**
- **Chromium**
- **GitHub Actions**

```

```
