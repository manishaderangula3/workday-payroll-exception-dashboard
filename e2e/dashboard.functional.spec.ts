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
  });

  test("report specifications are included in the production bundle", async ({ request }) => {
    const response = await request.get("/reports/Payroll_Cost_Report.md");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/markdown");
    expect(await response.text()).toContain("Payroll Cost");
  });
});
