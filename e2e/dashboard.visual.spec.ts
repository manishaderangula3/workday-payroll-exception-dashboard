import { expect, test } from "@playwright/test";

async function openDashboard(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Payroll Exception & Reporting Dashboard" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Dashboard reports" }).getByRole("button", { name: /^Overview/ })
  ).toBeVisible();
}

test("sample dashboard overview matches the approved visual baseline", async ({ page }) => {
  await openDashboard(page);

  await expect(page).toHaveScreenshot("dashboard-overview.png", {
    fullPage: true,
    mask: [page.getByTestId("last-updated")]
  });
});

test("backend proxy mode shows role-scoped manager data", async ({ page }) => {
  await openDashboard(page);

  await page.getByLabel("Username").fill("operations.manager");
  await page.getByLabel("Password").fill("ManagerDemo123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Operations Manager - Department Manager")).toBeVisible();

  await page.getByRole("button", { name: "Load Proxy Data" }).click();
  await expect(page.getByRole("heading", { name: "Backend proxy data" })).toBeVisible();
  await page.getByRole("navigation", { name: "Dashboard reports" }).getByRole("button", { name: "Payroll Costs" }).click();
  await expect(page.getByRole("heading", { name: "Payroll Cost Summary Report" })).toBeVisible();
  await expect(page.locator("tbody").getByText("Operations", { exact: true }).first()).toBeVisible();
  await expect(page.locator("tbody").getByText("Finance", { exact: true })).toHaveCount(0);

  await expect(page).toHaveScreenshot("backend-proxy-manager-scope.png", {
    fullPage: true,
    mask: [page.getByTestId("last-updated")]
  });
});

test("mobile layout keeps dashboard controls usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only visual coverage.");

  await openDashboard(page);
  await expect(page.getByLabel("Pay Period")).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();

  await expect(page).toHaveScreenshot("dashboard-mobile.png", {
    fullPage: true,
    mask: [page.getByTestId("last-updated")]
  });
});
