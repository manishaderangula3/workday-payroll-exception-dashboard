import { expect, test } from "@playwright/test";

test.describe("@functional production controls", () => {
  test("restricted manager cannot export role-scoped payroll data", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill("operations.manager");
    await page.getByLabel("Password").fill("ManagerDemo123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Load Proxy Data" }).click();
    await page.getByRole("navigation", { name: "Dashboard reports" }).getByRole("button", { name: "Payroll Costs" }).click();
    await expect(page.getByRole("heading", { name: "Payroll Cost Summary Report" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Export/ })).toHaveCount(0);

    const response = await page.request.post("/api/exports/report", {
      data: {
        reportType: "payroll-costs",
        filters: {
          payPeriod: await page.getByLabel("Pay Period").inputValue(),
          company: "All Companies",
          payGroup: "All Pay Groups",
          department: "All Departments",
          searchTerm: ""
        }
      }
    });
    expect(response.status()).toBe(403);
  });

  test("authorized payroll user receives a server-generated workbook", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill("payroll.admin");
    await page.getByLabel("Password").fill("PayrollDemo123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Load Proxy Data" }).click();
    const response = await page.request.post("/api/exports/report", {
      data: {
        reportType: "payroll-costs",
        filters: {
          payPeriod: await page.getByLabel("Pay Period").inputValue(),
          company: "All Companies",
          payGroup: "All Pay Groups",
          department: "All Departments",
          searchTerm: ""
        }
      }
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/vnd.openxmlformats");
    expect((await response.body()).subarray(0, 2).toString()).toBe("PK");
  });

  test("finance users cannot call payroll workflow actions directly", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill("finance.analyst");
    await page.getByLabel("Password").fill("FinanceDemo123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Load Proxy Data" }).click();

    const acknowledgement = await page.request.post("/api/acknowledgements", {
      data: { employeeId: "W-2001", payPeriod: "2026-09-15 Semi-Monthly" }
    });
    const inboxTask = await page.request.post("/api/actions/workday-inbox", {
      data: { employeeId: "W-2001", payPeriod: "2026-09-15 Semi-Monthly" }
    });

    expect(acknowledgement.status()).toBe(403);
    expect(inboxTask.status()).toBe(403);
  });

  test("duplicate acknowledgements reuse the existing audit event", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Username").fill("payroll.admin");
    await page.getByLabel("Password").fill("PayrollDemo123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByRole("button", { name: "Load Proxy Data" }).click();
    const data = { employeeId: "W-2001", payPeriod: `security-test-${Date.now()}` };

    const first = await page.request.post("/api/acknowledgements", { data });
    const second = await page.request.post("/api/acknowledgements", { data });

    expect(first.status()).toBe(201);
    expect(second.status()).toBe(200);
    expect((await second.json()).duplicate).toBe(true);
  });

  test("report specifications are included in the production bundle", async ({ request }) => {
    const response = await request.get("/reports/Payroll_Cost_Report.md");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/markdown");
    expect(await response.text()).toContain("Payroll Cost");
  });
});
