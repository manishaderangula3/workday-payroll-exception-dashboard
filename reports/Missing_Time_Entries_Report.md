# Missing Time Entries Report

## 1. Report Overview

| Item | Specification |
| --- | --- |
| Report Name | Missing Time Entries Exception Report |
| Report Type | Workday Advanced Report |
| Primary Purpose | Identify workers who have not submitted required time entries for scheduled work days in the selected pay period. |
| Audience | Payroll Manager, Managers, HR Partners |
| Criticality | Must be resolved before payroll approval |
| Output Format | Workday report grid with drill-down links and Excel export |
| Recommended Security | Payroll Manager, Time Tracking Administrator, HR Partner, Manager, or equivalent time tracking reporting security group |
| Refresh Cadence | Daily during the pay period and multiple times on payroll cutoff day |

## 2. Data Source

| Data Source Role | Workday Object or Source | Usage |
| --- | --- | --- |
| Primary Data Source | All Time Entries | Returns submitted, draft, approved, and missing time entry context for the selected pay period. |
| Related Business Object | Workers | Provides employee identity, department, manager, manager email, worker status, and eligibility context. |
| Related Business Object | Work Schedules | Provides scheduled work days and expected hours used to determine whether time entries are required. |
| Related Business Object | Time Off Requests | Identifies approved leave days that should be excluded from missing time calculations. |

### Data Source Notes

- The report should compare scheduled work days against submitted or approved time entry days.
- Approved time off should reduce expected work days so workers on approved leave are not incorrectly flagged.
- The report should focus on active workers who are required to enter time for the selected period.
- Draft entries should be visible in the Time Entry Status column but should not be treated as payroll-ready unless tenant policy considers draft time acceptable.

## 3. Report Columns

| Column Name | Source Field | Format |
| --- | --- | --- |
| Employee ID | Worker > Employee ID | Text |
| Employee Name | Worker > Preferred Name or Legal Name | Text |
| Department | Worker Organization > Supervisory Organization or Cost Center Department | Text |
| Manager | Worker > Manager | Text |
| Manager Email | Manager > Primary Work Email | Email |
| Work Schedule | Work Schedule Calendar > Schedule Pattern | Text, example: Mon-Fri, 8hrs |
| Expected Work Days in Period | Calculated Field: Scheduled Work Days - Approved Leave Days | Number, 0 decimals |
| Submitted Time Entry Days | Time Entries > Count of Submitted or Approved Time Entry Days | Number, 0 decimals |
| Missing Days Count | CF_Missing_Time_Days | Number, 0 decimals |
| Missing Dates | CF_Missing_Time_Dates | Date list |
| Last Submission Date | Time Entries > Most Recent Submission Date | Date |
| Time Entry Status | Time Entry > Status | Text, values: Draft, Submitted, Approved |
| Missing Time Flag | CF_Missing_Time_Flag | Boolean |
| Manager Notification Link | Workday Notification or Mailto Link | URL or Text |
| Worker Time Entry Link | Worker Time Entry or Enter Time Drill-down | URL or Drill-down |
| Days Until Payroll Deadline | CF_Days_Until_Payroll_Deadline | Number, 0 decimals |

### Calculated Field Requirements

| Calculated Field | Type | Logic |
| --- | --- | --- |
| CF_Expected_Work_Days | Count Related Instances or Evaluate Expression | Count scheduled work days in the selected pay period, excluding non-working days and holidays if tenant policy requires. |
| CF_Approved_Leave_Days | Count Related Instances | Count approved time off request days that overlap scheduled work days in the selected pay period. |
| CF_Submitted_Time_Entry_Days | Count Related Instances | Count unique days with submitted or approved time entries in the selected pay period. |
| CF_Missing_Time_Days | Arithmetic Calculation | CF_Expected_Work_Days - CF_Approved_Leave_Days - CF_Submitted_Time_Entry_Days. Return 0 when the result is negative. |
| CF_Missing_Time_Dates | Extract Multi-Instance or Evaluate Expression | Return scheduled work dates without submitted or approved time entries and without approved leave. |
| CF_Missing_Time_Flag | True/False Condition | True when CF_Missing_Time_Days is greater than or equal to the Minimum Missing Days Threshold prompt. |
| CF_Days_Until_Payroll_Deadline | Date Difference | Payroll approval deadline date - current date. |

## 4. Filters and Prompts

| Filter | Type | Required | Prompt Behavior |
| --- | --- | --- | --- |
| Missing Time Flag | Fixed filter | Yes | Include only rows where CF_Missing_Time_Flag = True. |
| Pay Period | Prompt-driven | Yes | User selects the pay period to review. Default to the current open pay period when available. |
| Department | Prompt-driven | No | User may select one or more departments. Leave blank to include all eligible departments. |
| Minimum Missing Days Threshold | Prompt-driven | No | Default value is 1. Include only workers with missing days greater than or equal to the prompt value. |
| Approved Leave | Fixed exclusion | Yes | Exclude workers or dates covered by approved leave for the selected period. |

### Recommended Filter Logic

- Worker is active or otherwise expected to submit time during the selected pay period.
- Worker is assigned to a work schedule requiring time entry.
- CF_Missing_Time_Flag equals True.
- Pay Period is in the prompt selection.
- If Department prompt is populated, include only selected departments.
- CF_Missing_Time_Days is greater than or equal to the Minimum Missing Days Threshold prompt value.
- Exclude scheduled dates that overlap approved time off requests.

## 5. Grouping

Group the detailed report in this hierarchy:

1. Department
2. Manager

Recommended subtotal placement:

- Department subtotal showing total workers with missing time and total missing days.
- Manager subtotal showing total direct reports with missing time and total missing days.

## 6. Sorting

| Sort Order | Field | Direction |
| --- | --- | --- |
| 1 | Missing Days Count | Descending |
| 2 | Days Until Payroll Deadline | Ascending |
| 3 | Department | A-Z |
| 4 | Manager | A-Z |
| 5 | Employee Name | A-Z |

The default view should surface workers with the highest number of missing days first, especially when the payroll deadline is near.

## 7. Action Items

| Action Item | Configuration | Purpose |
| --- | --- | --- |
| Manager Notification Link | Add a link or related action to email the worker's manager using Manager Email. | Allows Payroll or HR to quickly notify the accountable manager. |
| Worker Time Entry Link | Enable drill-down to the worker's time entry calendar or Enter Time page. | Allows authorized users to review missing dates and assist with correction. |
| Days Until Payroll Deadline Countdown | Display CF_Days_Until_Payroll_Deadline. | Prioritizes urgent exceptions before payroll approval. |
| Missing Dates Review | Display CF_Missing_Time_Dates as a comma-separated list or related instance list. | Gives managers the exact dates requiring action. |
| Status Review | Display Draft, Submitted, or Approved status. | Helps distinguish truly missing entries from entries that are started but not submitted or approved. |

### Recommended Workflow

1. Payroll Manager runs the report for the current pay period.
2. Report displays only workers with missing time exceptions.
3. Payroll Manager reviews critical rows where Missing Days Count is greater than 3 or the payroll deadline is within 1 day.
4. Manager receives notification with employee name, missing dates, and a link to review or approve time.
5. Worker submits missing time entries through Workday.
6. Manager approves submitted time entries.
7. Payroll Manager reruns the report and confirms the worker no longer appears as an exception.

## 8. Conditional Formatting

| Condition | Formatting | Severity |
| --- | --- | --- |
| Missing Days Count > 3 | Red fill or red bold text on Missing Days Count, Missing Dates, and Missing Time Flag | Critical |
| Missing Days Count between 1 and 2 | Yellow fill or amber text on Missing Days Count and Missing Time Flag | Warning |
| Days Until Payroll Deadline <= 1 | Red text or bold emphasis | Critical |
| Time Entry Status = Draft | Yellow or amber text | Action required |

### Formatting Notes

- Red rows should be reviewed before payroll approval.
- Yellow rows should be routed to managers for same-day follow-up.
- Draft entries should remain visible because they may explain missing submitted or approved time.

## 9. Integration Points

| Integration Point | Description | Trigger |
| --- | --- | --- |
| Email Notification to Managers | Send a report-based notification to each manager with direct reports missing time. Include employee name, missing dates, pay period, and deadline. | Scheduled daily during payroll processing or manually triggered by Payroll Manager. |
| Workday Inbox Task Creation | Create a Workday inbox task for managers to review missing time and prompt workers to submit entries. | Trigger when CF_Missing_Time_Flag = True and Missing Days Count meets the threshold. |
| Payroll Close Checklist | Add report review as a required payroll close task. | Before payroll approval or final calculation. |
| Dashboard Exception Tile | Display count of workers with missing time and total missing days. | Updated whenever the exception dashboard refreshes. |

### Notification Content

Recommended manager notification fields:

- Manager name
- Employee ID
- Employee name
- Pay period
- Missing dates
- Days until payroll deadline
- Worker time entry link
- Payroll or HR contact for questions

## 10. Sample Output

```text
Missing Time Entries Exception Report
Prompts: Pay Period = 2026-07-19 to 2026-08-01 | Department = All | Minimum Missing Days Threshold = 1

Department: Customer Support
  Manager: Avery Brooks
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Manager Email           | Work Schedule | Expected Days | Submitted Days | Missing Days | Missing Dates              | Last Submitted | Status    | Deadline
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  300142      | Jordan Patel  | avery.brooks@example.com| Mon-Fri, 8hrs | 10            | 5              | 5            | 2026-07-24, 07-28, 07-29...| 2026-07-23     | Submitted | 1
  300188      | Casey Nguyen  | avery.brooks@example.com| Mon-Fri, 8hrs | 10            | 8              | 2            | 2026-07-30, 2026-07-31     | 2026-07-29     | Draft     | 1
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  Manager Subtotal                                               Workers with Missing Time: 2       Missing Days: 7

Department: Operations
  Manager: Priya Shah
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  Employee ID | Employee Name | Manager Email        | Work Schedule | Expected Days | Submitted Days | Missing Days | Missing Dates              | Last Submitted | Status    | Deadline
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  300244      | Taylor Kim    | priya.shah@example.com| Tue-Sat, 8hrs | 10            | 7              | 3            | 2026-07-25, 07-26, 08-01   | 2026-07-24     | Submitted | 1
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  Manager Subtotal                                               Workers with Missing Time: 1       Missing Days: 3

Company Total                                                    Workers with Missing Time: 3       Missing Days: 10
```

## 11. Configuration Steps in Workday

1. Navigate to **Create Custom Report**.
2. Enter the report name **Missing Time Entries Exception Report**.
3. Select **Advanced** as the report type.
4. Select **All Time Entries** as the primary data source.
5. Enable prompts for the report.
6. Confirm the report is available to authorized Payroll Manager, Manager, and HR Partner security groups.
7. Add related business objects for Workers, Work Schedules, and Time Off Requests.
8. Add Employee ID, Employee Name, Department, Manager, Manager Email, Work Schedule, Last Submission Date, and Time Entry Status columns.
9. Create or attach **CF_Expected_Work_Days** to count scheduled work days in the selected pay period.
10. Create or attach **CF_Approved_Leave_Days** to identify approved leave dates that overlap scheduled work days.
11. Create or attach **CF_Submitted_Time_Entry_Days** to count submitted or approved time entry days.
12. Create **CF_Missing_Time_Days** using expected work days minus approved leave days minus submitted time entry days.
13. Create **CF_Missing_Time_Dates** to list scheduled dates without submitted or approved time.
14. Create **CF_Missing_Time_Flag** to return True when missing days meet the threshold.
15. Create **CF_Days_Until_Payroll_Deadline** using the payroll approval deadline date and current date.
16. Add a fixed filter where CF_Missing_Time_Flag = True.
17. Configure prompts for Pay Period, Department, and Minimum Missing Days Threshold.
18. Set the Minimum Missing Days Threshold prompt default to 1.
19. Add filter logic to exclude approved leave dates from missing time calculations.
20. Configure grouping by Department, then Manager.
21. Configure sorting by Missing Days Count descending.
22. Add manager and department subtotals for workers with missing time and missing days count.
23. Add conditional formatting for red critical exceptions and yellow warning exceptions.
24. Enable drill-down from Employee Name or Worker Time Entry Link to worker time entry details.
25. Add a manager notification link using Manager Email.
26. Configure report-based email notification to managers if supported by tenant policy.
27. Configure Workday inbox task creation for managers when missing time exceptions remain unresolved.
28. Test the report using a current open pay period with known missing time entries.
29. Validate that workers on approved leave do not appear incorrectly.
30. Validate that draft time entries remain visible but do not clear the exception unless submitted or approved.
31. Export the report to Excel and confirm grouping, sorting, links, and conditional formatting are preserved where supported.
32. Add the report to the payroll close checklist and exception dashboard if applicable.

## Acceptance Criteria

- Report displays only workers with missing required time entries.
- Expected work days are compared against submitted or approved time entry days.
- Approved leave dates are excluded from missing time calculations.
- Missing days count and missing dates are visible to Payroll, HR, and authorized managers.
- Red and yellow conditional formatting clearly distinguishes critical and warning exceptions.
- Manager notification and worker time entry drill-down actions are documented.
- Email and Workday inbox integration points are included for follow-up workflow.
