import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { DataSourcePanel } from "./components/DataSourcePanel";
import { DashboardShell } from "./components/DashboardShell";
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
  type UploadedDatasetMap
} from "./lib/uploadedData";
import type {
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

export function App() {
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>("sample");
  const [uploadedDatasets, setUploadedDatasets] = useState<UploadedDatasetMap>({});
  const [uploadSummaries, setUploadSummaries] = useState<Partial<Record<UploadDatasetKey, UploadedDatasetSummary>>>({});
  const [uploadMessages, setUploadMessages] = useState<UploadValidationMessage[]>([]);
  const activeData = useMemo(
    () => (dataSourceMode === "uploaded" ? buildActiveDashboardData(uploadedDatasets) : sampleDashboardData),
    [dataSourceMode, uploadedDatasets]
  );
  const filterOptions = useMemo(() => getFilterOptions(activeData), [activeData]);
  const [filters, setFilters] = useState<DashboardFilters>(() => getDefaultFilters(sampleDashboardData.payPeriods[0]));
  const [thresholds, setThresholds] = useState<DashboardThresholds>(defaultThresholds);
  const [activeRole, setActiveRole] = useState<RoleKey>("workday-payroll-analyst");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeRoleTitle = roleLenses.find((role) => role.key === activeRole)?.title ?? "Payroll Stakeholders";

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

  function handleFilterChange(updates: Partial<DashboardFilters>) {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates }));
  }

  function handleThresholdChange(updates: Partial<DashboardThresholds>) {
    setThresholds((currentThresholds) => ({ ...currentThresholds, ...updates }));
  }

  function handleRefresh() {
    setIsRefreshing(true);
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
    const text = await file.text();
    const result = parseUploadedDataset(dataset, text);
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

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader
        filterOptions={filterOptions}
        filters={filters}
        isRefreshing={isRefreshing}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        roleTitle={activeRoleTitle}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <RoleLensPanel activeRole={activeRole} onRoleChange={setActiveRole} onTabChange={setActiveTab} />
        <DataSourcePanel
          messages={uploadMessages}
          mode={dataSourceMode}
          onClearUploads={handleClearUploads}
          onFileUpload={handleFileUpload}
          onModeChange={setDataSourceMode}
          summaries={uploadSummaries}
        />
        <ThresholdControls
          onReset={() => setThresholds(defaultThresholds)}
          onThresholdChange={handleThresholdChange}
          thresholds={thresholds}
        />
        <FilterSummary filters={filters} isRefreshing={isRefreshing} lastUpdated={lastUpdated} />
        <DashboardShell
          activeTab={activeTab}
          data={activeData}
          filters={filters}
          isRefreshing={isRefreshing}
          onClearFilters={handleClearFilters}
          onTabChange={setActiveTab}
          thresholds={thresholds}
        />
      </main>
    </div>
  );
}
