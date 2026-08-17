# Lessons Learned

## 1. Document Overview

| Item | Specification |
| --- | --- |
| Project | Workday Payroll Exception Dashboard |
| Document Purpose | Capture what worked well, challenges faced, key learnings, future recommendations, and project delivery metrics. |
| Audience | Payroll Operations, HRIS, Workday Reporting Team, Project Sponsor, Future Project Teams |
| Project Duration | 4 weeks |
| Project Role | Workday Report Developer / Functional Consultant |
| Completion Phase | Day 20 - Lessons Learned, README & Final Review |

## 2. Executive Summary

The Payroll Exception Dashboard project successfully defined a Workday-native reporting solution for payroll cost visibility, overtime monitoring, missing time detection, deduction exceptions, tax exceptions, and consolidated dashboard review. The project reinforced the value of reusable calculated fields, early stakeholder validation, and a modular reporting architecture that allows standalone reports to feed a composite dashboard.

The largest lessons centered on performance, security, and calculated field complexity. Future Workday reporting projects should validate data sources and security patterns before report build begins, test calculated fields independently, and establish performance benchmarks for expected worker and payroll-result volume.

## 3. What Went Well

| Area | Lesson | Business Impact |
| --- | --- | --- |
| Business requirements | Clear business requirements from stakeholders reduced rework. | Report scope stayed focused on payroll close risks and daily user needs. |
| Reusable logic | Calculated fields approach provided reusable logic across reports. | Payroll status, overtime, missing time, deduction, and tax logic could be reused in detail reports and dashboard KPIs. |
| Dashboard design | Composite dashboard gave users a single-pane-of-glass view. | Payroll Managers could review exception counts, KPIs, and drill-downs from one landing point. |
| Iterative delivery | Iterative development with weekly demos ensured alignment. | Stakeholders could validate report structure, thresholds, and navigation before final documentation. |
| Finance usability | Excel export capability met Finance team's analysis needs. | Finance users could review payroll cost totals and perform offline analysis for close activities. |
| Testing structure | Test cases and UAT scenarios were built around business workflows. | QA and UAT could validate both technical behavior and real payroll close use cases. |
| Documentation coverage | Specifications were created for reports, dashboards, KPIs, testing, defects, assumptions, and portfolio samples. | The repository became a complete implementation reference, not only a set of report names. |

## 4. Challenges Faced

| Challenge | Description | Impact | Response |
| --- | --- | --- | --- |
| Large dataset performance | Performance issues with large datasets required filter optimization. | Composite dashboard and detail reports risked slow load times for large organizations. | Added shared prompts, row limits, pagination recommendations, and performance test cases. |
| Security complexity | Security configuration was more complex than estimated, especially row-level security. | HR Partner and Manager views required careful organization and role validation. | Added security assumptions, security tests, UAT security scenario, and defect examples. |
| Calculated field nesting | Calculated field nesting limits in Workday required workarounds. | Some business logic could not be expressed as one deeply nested formula. | Recommended modular calculated fields and a reusable calculated field catalog. |
| Test data gaps | Test data did not fully represent production scenarios. | Edge cases such as multi-state tax, partial PTO, arrears, and large populations were harder to validate. | Added detailed test data requirements and sandbox scenario setup guidance. |
| Multi-state tax logic | Multi-state tax logic was more complex than initially scoped. | Tax exception report required jurisdiction, reciprocity, tax election, and withholding variance considerations. | Expanded Tax Exception Report and `CF_Tax_Exception` documentation with edge-case validation. |
| Export behavior | Excel export formatting needed separate validation. | Some grouping, subtotal, and date-format behavior may differ from on-screen report output. | Added export-specific test cases, defect examples, and acceptance criteria. |
| Prompt behavior | Composite report shared prompts may not apply uniformly without careful mapping. | Tabs could show inconsistent data if prompt mapping is incomplete. | Documented shared prompt rules and test cases for tab-level prompt filtering. |

## 5. Key Learnings

| Learning | Practical Application |
| --- | --- |
| Start with data source validation before building reports. | Confirm payroll results, time entries, benefits, tax elections, worker schedules, and organizations are available and reportable before building final layouts. |
| Test calculated fields independently before embedding in reports. | Validate each calculated field with controlled workers and edge cases before using it in dashboards or KPIs. |
| Security should be designed first, not added last. | Define Payroll Admin, HR Partner, Manager, Finance, Benefits, and Tax Analyst access before report build and UAT. |
| Composite reports have limitations on shared prompts, so design around them. | Map shared prompts carefully to each tab and include prompt-specific regression tests. |
| Always include a no-exceptions state in testing. | Validate the happy path where payroll is complete and all exception categories are clear. |
| Excel export formatting requires a separate testing pass. | Test grouping, subtotals, currency, dates, prompts, and confidentiality notices after export. |
| Involve payroll SMEs in calculated field validation early. | Payroll, Benefits, Tax, and HR stakeholders should review formulas before UAT. |
| Performance should be tested with realistic volume. | Use representative worker counts, pay groups, and payroll result rows before production rollout. |
| Exception counts need clear counting rules. | Distinguish distinct worker counts from row-level exception counts, especially for workers with multiple exceptions. |
| Documentation should include operational workflows, not only report fields. | Resolution steps, owners, notifications, and drill-down actions make reports usable for daily payroll operations. |

## 6. Recommendations for Future Projects

| Recommendation | Rationale | Owner |
| --- | --- | --- |
| Create a calculated field library/catalog for reuse. | Reusable fields reduce rework and improve consistency across reports. | Workday Reporting Team |
| Document Workday report type limitations upfront. | Advanced, Matrix, and Composite Reports have different capabilities and prompt behaviors. | HRIS / Reporting Lead |
| Build modular reports that can be composed into different dashboards. | Standalone reports can support dashboards, audits, exports, and role-specific views. | Workday Report Developer |
| Establish performance benchmarks early. | Worker count, pay period range, and result-row volume should guide report design. | Reporting Lead / QA |
| Include mobile and responsive design requirements from the start. | Managers may need to review urgent issues away from desktop. | Product Owner |
| Validate security with real role examples before UAT. | Security issues are expensive to fix late and can block go-live. | IT/Security |
| Maintain a test data scenario catalog. | Repeatable scenarios improve calculated field validation and regression testing. | QA Lead |
| Define export acceptance criteria early. | Finance and audit users often depend on Excel output, not only on-screen reports. | Finance / Payroll |
| Capture known limitations and assumptions in the repository. | Future maintainers need to know what the solution intentionally does and does not cover. | Project Team |

## 7. Project Metrics

| Metric | Result | Notes |
| --- | --- | --- |
| Reports delivered | 5 advanced reports + 1 composite dashboard | Payroll Cost, Overtime, Missing Time, Deduction Exceptions, Tax Exceptions, and Composite Dashboard. Dashboard Overview was also documented as the landing summary report. |
| Calculated fields created | 5+ | Payroll Status, Overtime Hours, Missing Time, Deduction Exception, Tax Exception, plus companion variance and count fields. |
| Test cases documented | 75+ | Includes calculated field, report, dashboard, security, and performance tests. |
| UAT scenarios documented | 10 | Covers Payroll, HR, Finance, Manager, Benefits, Tax, Security, mobile, and scheduled report workflows. |
| Defects found and documented | 15 | Sample defect log includes Critical, High, Medium, and Low examples. |
| Defects resolved in sample log | 4 resolved + 2 closed | Remaining Critical and High items require remediation before production migration. |
| User satisfaction score | To be captured from UAT feedback | Recommended scale: 1-5 overall usability and business fit rating. |
| Project duration | 4 weeks | Documentation, report specifications, dashboard design, testing artifacts, and final review. |

## 8. UAT Feedback Themes

| Theme | Feedback to Capture | Follow-up |
| --- | --- | --- |
| Usability | Can Payroll Managers find the most urgent issues quickly? | Refine KPI card ordering, alert section, and drill-down labels if needed. |
| Accuracy | Do totals reconcile to payroll register, time tracking, benefits, and tax data? | Resolve discrepancies before sign-off. |
| Security | Do users see only the right workers and fields? | Retest all security roles before production. |
| Export | Does Excel output support Finance and audit needs? | Adjust formatting or provide export guidance. |
| Performance | Does the dashboard load within payroll close expectations? | Optimize prompts and report volume if needed. |

## 9. Final Retrospective

This project showed that Workday-native reporting can deliver strong payroll exception visibility when the design is modular, security-aware, and built around payroll operations workflows. The most valuable architectural decision was separating reusable exception logic into calculated fields and then using those fields consistently across detailed reports and the composite dashboard.

For future projects, the team should begin with data source validation, security design, and performance assumptions before building user-facing reports. Those early decisions reduce late rework and make UAT more focused on business acceptance rather than foundational configuration issues.

## Acceptance Criteria

- What went well, challenges, key learnings, and future recommendations are documented.
- Metrics include reports delivered, calculated fields, test cases, defects, and UAT satisfaction placeholder.
- Lessons are specific to Workday reporting, payroll exception logic, security, performance, and dashboard delivery.
- The document can be used as a reusable retrospective reference for future Workday reporting projects.
