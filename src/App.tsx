import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { AuthSecurityPanel } from "./components/AuthSecurityPanel";
import { DataSourcePanel } from "./components/DataSourcePanel";
import { DashboardShell } from "./components/DashboardShell";
import { DashboardStatusStrip } from "./components/DashboardStatusStrip";
import { FilterSummary } from "./components/FilterSummary";
import { getFilterOptions } from "./lib/filterOptions";
import { RoleLensPanel } from "./components/RoleLensPanel";
import { roleLenses } from "./data/roleLenses";
import { ThresholdControls } from "./components/ThresholdControls";
import { defaultThresholds } from "./data/thresholds";
import { sampleDashboardData } from "./data";
import {
  buildActiveDashboardData,
  parseUploadedDataset,
  validateUploadFile,
  type UploadedDatasetMap
} from "./lib/uploadedData";
import {
  getBackendSession,
  loadBackendDashboardData,
  loginToBackend,
  logoutFromBackend
} from "./lib/backendApi";
import type {
  AuthenticatedUser,
  DataSourceMode,
  DashboardFilters,
  DashboardThresholds,
  RoleKey,
  UploadedDatasetSummary,
  UploadDatasetKey,
  UploadValidationMessage
} from "./types/dashboard";

function getDefaultFilters(payPeriod = "2026-08-15 Semi-Monthly"): DashboardFilters {
  return {
    payPeriod,
    company: "All Companies",
    payGroup: "All Pay Groups",
    department: "All Departments",
    searchTerm: ""
  };
}

function getInitialFilters(payPeriod: string): DashboardFilters {
  const defaults = getDefaultFilters(payPeriod);
  const params = new URLSearchParams(window.location.search);
  return {
    payPeriod: params.get("payPeriod") || defaults.payPeriod,
    company: params.get("company") || defaults.company,
    payGroup: params.get("payGroup") || defaults.payGroup,
    department: params.get("department") || defaults.department,
    searchTerm: params.get("search") || defaults.searchTerm
  };
}

export function App() {
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>("sample");
  const [uploadedDatasets, setUploadedDatasets] = useState<UploadedDatasetMap>({});
  const [proxyDatasets, setProxyDatasets] = useState<UploadedDatasetMap>({});
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const [authMode, setAuthMode] = useState<"local" | "azure_easy_auth">("local");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [uploadSummaries, setUploadSummaries] = useState<Partial<Record<UploadDatasetKey, UploadedDatasetSummary>>>({});
  const [uploadMessages, setUploadMessages] = useState<UploadValidationMessage[]>([]);
  const activeData = useMemo(() => {
    if (dataSourceMode === "uploaded") {
      return buildActiveDashboardData(uploadedDatasets);
    }

    if (dataSourceMode === "proxy") {
      return buildActiveDashboardData(proxyDatasets);
    }

    return sampleDashboardData;
  }, [dataSourceMode, proxyDatasets, uploadedDatasets]);
  const filterOptions = useMemo(() => getFilterOptions(activeData), [activeData]);
  const [filters, setFilters] = useState<DashboardFilters>(() => getInitialFilters(sampleDashboardData.payPeriods[0]));
  const [thresholds, setThresholds] = useState<DashboardThresholds>(defaultThresholds);
  const [activeRole, setActiveRole] = useState<RoleKey>("workday-payroll-analyst");
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "overview");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeRoleTitle = roleLenses.find((role) => role.key === activeRole)?.title ?? "Payroll Stakeholders";

  useEffect(() => {
    getBackendSession()
      .then((session) => {
        setAuthMode(session.authMode);
        setAuthUser(session.user);
        setAuthMessage(session.authenticated ? "Backend session restored." : "Sign in to load role-scoped proxy data.");
      })
      .catch(() => setAuthMessage("Backend proxy is not running. Start it to use Workday RaaS/API mode."));
  }, []);

  useEffect(() => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      payPeriod: filterOptions.payPeriods.includes(currentFilters.payPeriod)
        ? currentFilters.payPeriod
        : filterOptions.payPeriods[0] ?? currentFilters.payPeriod,
      company: filterOptions.companies.includes(currentFilters.company) ? currentFilters.company : "All Companies",
      payGroup: filterOptions.payGroups.includes(currentFilters.payGroup) ? currentFilters.payGroup : "All Pay Groups",
      department: filterOptions.departments.includes(currentFilters.department)
        ? currentFilters.department
        : "All Departments"
    }));
  }, [filterOptions]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    params.set("payPeriod", filters.payPeriod);
    params.set("company", filters.company);
    params.set("payGroup", filters.payGroup);
    params.set("department", filters.department);
    if (filters.searchTerm) params.set("search", filters.searchTerm);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [activeTab, filters]);

  function handleFilterChange(updates: Partial<DashboardFilters>) {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates }));
  }

  function handleThresholdChange(updates: Partial<DashboardThresholds>) {
    setThresholds((currentThresholds) => ({ ...currentThresholds, ...updates }));
  }

  async function handleRefresh() {
    setIsRefreshing(true);

    if (dataSourceMode === "proxy" && authUser) {
      await handleLoadProxyData();
      setIsRefreshing(false);
      return;
    }

    window.setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 450);
  }

  function handleClearFilters() {
    setFilters(getDefaultFilters(activeData.payPeriods[0]));
    setActiveTab("overview");
  }

  async function handleFileUpload(dataset: UploadDatasetKey, file: File) {
    const fileMessages = validateUploadFile(dataset, file);

    if (fileMessages.length > 0) {
      setUploadMessages(fileMessages);
      return;
    }

    let result: ReturnType<typeof parseUploadedDataset>;

    try {
      const text = await file.text();
      result = parseUploadedDataset(dataset, text);
    } catch {
      setUploadMessages([
        {
          dataset,
          message: "Upload could not be read. Confirm the file is a valid CSV export and try again.",
          severity: "error"
        }
      ]);
      return;
    }

    const blockingErrors = result.messages.filter((message) => message.severity === "error");

    setUploadMessages(result.messages);

    if (blockingErrors.length > 0 || result.rows.length === 0) {
      return;
    }

    setUploadedDatasets((currentDatasets) => ({
      ...currentDatasets,
      [dataset]: result.rows
    }));
    setUploadSummaries((currentSummaries) => ({
      ...currentSummaries,
      [dataset]: {
        fileName: file.name,
        loadedAt: new Date().toISOString(),
        rowCount: result.rows.length
      }
    }));
    setDataSourceMode("uploaded");
    setLastUpdated(new Date());
  }

  function handleClearUploads() {
    setUploadedDatasets({});
    setUploadSummaries({});
    setUploadMessages([]);
    setDataSourceMode("sample");
    setFilters(getDefaultFilters(sampleDashboardData.payPeriods[0]));
    setActiveTab("overview");
  }

  async function handleBackendLogin(username: string, password: string) {
    setIsAuthLoading(true);
    try {
      const session = await loginToBackend(username, password);
      setAuthUser(session.user);
      setAuthMessage(session.user ? `Signed in as ${session.user.displayName}.` : "Sign in failed.");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleBackendLogout() {
    setIsAuthLoading(true);
    try {
      const session = await logoutFromBackend();
      if (session.logoutUrl) {
        window.location.assign(session.logoutUrl);
        return;
      }
      setAuthUser(null);
      setProxyDatasets({});
      setDataSourceMode("sample");
      setAuthMessage("Signed out. Sample data is active.");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleLoadProxyData() {
    setIsAuthLoading(true);
    try {
      const response = await loadBackendDashboardData();
      setProxyDatasets(response.data as UploadedDatasetMap);
      setAuthUser(response.user);
      setDataSourceMode("proxy");
      setLastUpdated(new Date());
      setAuthMessage(
        response.source === "workday"
          ? "Loaded role-scoped Workday RaaS/API data from the backend proxy."
          : "Loaded role-scoped demo data from the backend proxy. Configure Workday URLs to use live RaaS/API data."
      );
      setUploadMessages(
        response.warnings.map((message) => ({
          dataset: "workers",
          message,
          severity: "warning"
        }))
      );
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Unable to load backend proxy data.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        filterOptions={filterOptions}
        filters={filters}
        isRefreshing={isRefreshing}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onCopyLink={() => navigator.clipboard.writeText(window.location.href)}
        roleTitle={activeRoleTitle}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardStatusStrip
          activeRoleTitle={activeRoleTitle}
          data={activeData}
          dataSourceMode={dataSourceMode}
          filters={filters}
          thresholds={thresholds}
          uploadedDatasetCount={Object.keys(uploadedDatasets).length}
        />
        <FilterSummary filters={filters} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
        <DashboardShell
          activeTab={activeTab}
          canExport={dataSourceMode !== "proxy" || authUser?.canExport === true}
          data={activeData}
          dataSourceMode={dataSourceMode}
          filters={filters}
          isRefreshing={isRefreshing}
          onClearFilters={handleClearFilters}
          onTabChange={setActiveTab}
          thresholds={thresholds}
        />

        <section className="space-y-5 pt-2">
          <div className="flex flex-col gap-1 border-t border-slate-200 pt-5">
            <p className="mini-label">Configuration & Data Controls</p>
            <h2 className="text-xl font-semibold text-workday-ink">Dashboard controls</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Role framing, security, source data, and threshold controls stay available below the reporting view.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <RoleLensPanel activeRole={activeRole} onRoleChange={setActiveRole} onTabChange={setActiveTab} />
            <AuthSecurityPanel
              authMode={authMode}
              isLoading={isAuthLoading}
              message={authMessage}
              onLoadProxyData={handleLoadProxyData}
              onLogin={handleBackendLogin}
              onLogout={handleBackendLogout}
              user={authUser}
            />
          </div>

          <DataSourcePanel
            messages={uploadMessages}
            mode={dataSourceMode}
            onClearUploads={handleClearUploads}
            onFileUpload={handleFileUpload}
            onModeChange={setDataSourceMode}
            proxyLoaded={Object.keys(proxyDatasets).length > 0}
            summaries={uploadSummaries}
          />
          <ThresholdControls
            onReset={() => setThresholds(defaultThresholds)}
            onThresholdChange={handleThresholdChange}
            thresholds={thresholds}
          />
        </section>
      </main>
    </div>
  );
}
