import { expect, test } from "@playwright/test";

test("dashboard meets throttled network budgets and keeps Excel lazy", async ({ context, page }, testInfo) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 200_000,
    uploadThroughput: 93_750,
    connectionType: "cellular3g"
  });

  const chartResponsePromise = page.waitForResponse((response) => /\/assets\/charts-.*\.js$/.test(response.url()));
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Payroll Exception & Reporting Dashboard" })).toBeVisible();
  const chartResponse = await chartResponsePromise;
  const chartHeaders = await chartResponse.allHeaders();
  expect(chartHeaders["content-encoding"]).toBe("gzip");
  expect(chartHeaders["cache-control"]).toContain("immutable");

  const initial = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const scripts = resources.filter((entry) => entry.name.endsWith(".js"));
    return {
      firstContentfulPaintMs: Math.round(paint?.startTime ?? 0),
      loadEventMs: Math.round(navigation.loadEventEnd),
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
      encodedJavaScriptBytes: scripts.reduce((total, entry) => total + entry.encodedBodySize, 0),
      scripts: scripts.map((entry) => entry.name.split("/").pop())
    };
  });

  expect(initial.scripts.some((name) => name?.startsWith("exceljs"))).toBe(false);
  expect(initial.firstContentfulPaintMs).toBeLessThanOrEqual(5_000);
  expect(initial.loadEventMs).toBeLessThanOrEqual(8_000);
  expect(initial.encodedJavaScriptBytes).toBeLessThanOrEqual(300_000);

  await page.getByRole("navigation", { name: "Dashboard reports" }).getByRole("button", { name: "Payroll Costs" }).click();
  const excelResponsePromise = page.waitForResponse((response) => /\/assets\/exceljs.*\.js$/.test(response.url()));
  const exportStartedAt = Date.now();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Current View" }).click();
  const [excelResponse] = await Promise.all([excelResponsePromise, downloadPromise]);
  const exportReadyMs = Date.now() - exportStartedAt;
  expect((await excelResponse.allHeaders())["content-encoding"]).toBe("gzip");
  const excelResource = await page.evaluate(() => {
    const entry = (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
      .find((resource) => /\/assets\/exceljs.*\.js$/.test(resource.name));
    return entry ? { encodedBytes: entry.encodedBodySize, durationMs: Math.round(entry.duration) } : null;
  });
  expect(excelResource).not.toBeNull();
  expect(excelResource!.encodedBytes).toBeLessThanOrEqual(350_000);
  expect(exportReadyMs).toBeLessThanOrEqual(12_000);

  const metrics = { profile: "1.6 Mbps download, 150 ms latency", initial, excelResource, exportReadyMs };
  await testInfo.attach("network-performance.json", {
    body: Buffer.from(JSON.stringify(metrics, null, 2)),
    contentType: "application/json"
  });
  console.log(JSON.stringify(metrics));
});
