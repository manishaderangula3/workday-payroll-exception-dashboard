import { assertRuntimeConfig, loadDotEnv, runtimeConfigurationStatus } from "../server/runtimeConfig.js";

loadDotEnv();

try {
  assertRuntimeConfig();
  const status = runtimeConfigurationStatus();
  console.log(`Runtime configuration passed for the ${status.profile} profile.`);
  console.log(JSON.stringify(status.integrations, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
