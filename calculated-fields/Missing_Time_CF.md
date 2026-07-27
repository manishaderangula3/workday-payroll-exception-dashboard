# Missing Time Entry Detection — Calculated Field Specification

## 1. Field Overview

| Attribute | Value |
|-----------|-------|
| **Field Name** | `CF_Missing_Time_Flag` |
| **Companion Field** | `CF_Missing_Time_Days` |
| **Purpose** | Identify workers with incomplete or missing time entries for a given pay period |
| **Return Type (Flag)** | Boolean (Yes/No) |
| **Return Type (Days)** | Numeric (Integer) |
| **Used In** | Missing Time Entries Report, Composite Dashboard Alert |
| **Data Source** | Worker Time Entry data, Work Schedule, Leave/Time-Off records |
| **Evaluation Frequency** | Per payroll processing cycle |
| **Owner** | Payroll Operations |

---

## 2. Business Logic

### 2.1 Core Detection Logic

The calculated field compares **expected work days** against **submitted time entries** within a pay period to identify gaps.

```
Missing_Days = Expected_Days - Submitted_Days
Flag = True if Missing_Days > 0
```

### 2.2 Definitions

| Term | Definition |
|------|-----------|
| **Expected Days** | Number of scheduled work days in the pay period based on the worker's assigned work schedule |
| **Submitted Days** | Count of distinct days with at least one submitted (or approved) time entry |
| **Filled Days** | Days covered by approved time-off, holidays, or leave of absence |
| **Effective Expected Days** | Expected Days minus Filled Days |
| **Missing Days** | MAX(0, Effective Expected Days - Submitted Days) |

### 2.3 Adjustments

| Scenario | Adjustment |
|----------|-----------|
| **Approved PTO** | Subtract from expected days (counts as filled) |
| **Company Holidays** | Subtract from expected days (counts as filled) |
| **Leave of Absence** | Subtract leave days from expected days |
| **Mid-Period Hire** | Only count expected days from worker start date forward |
| **Mid-Period Termination** | Only count expected days up to termination date |
| **Schedule Change Mid-Period** | Use effective schedule for each segment |

---

## 3. Formula

### 3.1 CF_Missing_Time_Flag (Boolean)

```
CF_Missing_Time_Flag =

  -- Step 1: Determine eligibility
  IF Worker.Time_Entry_Required = False THEN NULL  -- Not applicable
  IF Worker.Employment_Status = "Terminated" 
     AND Worker.Termination_Date < Pay_Period.Start_Date THEN NULL
  IF Worker.Hire_Date > Pay_Period.End_Date THEN NULL
  IF Worker.Leave_Status = "Full_Period_Leave" THEN NULL

  -- Step 2: Calculate expected days
  LET Period_Start = MAX(Pay_Period.Start_Date, Worker.Hire_Date)
  LET Period_End = MIN(Pay_Period.End_Date, 
                       COALESCE(Worker.Termination_Date, Pay_Period.End_Date))

  LET Expected_Days = COUNT(
    Work_Schedule.Scheduled_Days 
    WHERE Day BETWEEN Period_Start AND Period_End
  )

  -- Step 3: Subtract filled days
  LET Filled_Days = COUNT(
    Time_Off_Approved.Days + Company_Holidays.Days + Leave_Days
    WHERE Day BETWEEN Period_Start AND Period_End
  )

  LET Effective_Expected = Expected_Days - Filled_Days

  -- Step 4: Count submitted entries
  LET Submitted_Days = COUNT(DISTINCT 
    Time_Entries.Entry_Date 
    WHERE Worker_ID = Worker.ID 
      AND Entry_Date BETWEEN Period_Start AND Period_End
      AND Status IN ("Submitted", "Approved")
  )

  -- Step 5: Evaluate flag
  RETURN IF(Effective_Expected - Submitted_Days > 0, True, False)
```

### 3.2 CF_Missing_Time_Days (Numeric)

```
CF_Missing_Time_Days =

  -- Same eligibility and calculation steps as CF_Missing_Time_Flag
  -- (Steps 1-4 identical)

  -- Step 5: Return count
  RETURN MAX(0, Effective_Expected - Submitted_Days)
```

### 3.3 Edge Case Handling

| Edge Case | Handling |
|-----------|----------|
| Worker has no schedule assigned | Default to organization-level schedule; flag for review if none exists |
| Partial-day PTO | Count as filled only if covers full scheduled hours for that day |
| Multiple time entries per day | Count as single submitted day |
| Draft/unsubmitted entries | Do NOT count as submitted |
| Retroactive time entry | Include if submitted before payroll close |

---

## 4. Conditions & Eligibility

### 4.1 Inclusion Criteria

The calculated field applies to workers meeting **all** of the following:

- **Time Entry Required** = Yes (field on worker position/compensation)
- **Worker Type**: Hourly, Non-Exempt Salaried
- **Employment Status**: Active, On Leave (partial), Suspended with pay
- **Has valid work schedule** assigned for the pay period

### 4.2 Exclusion Criteria

Workers excluded from evaluation:

| Exclusion Reason | Logic |
|-----------------|-------|
| Exempt salaried workers | `Compensation.FLSA_Status = "Exempt"` |
| Terminated before period start | `Termination_Date < Pay_Period.Start_Date` |
| Not yet hired | `Hire_Date > Pay_Period.End_Date` |
| Full-period approved leave | All expected days covered by leave |
| Contingent workers (unless time-tracked) | `Worker_Type = "Contingent" AND Time_Entry_Required = False` |
| Workers on time-entry waiver | Custom flag `Time_Entry_Waiver = True` |

### 4.3 Threshold Configuration

| Parameter | Default | Configurable |
|-----------|---------|:------------:|
| Minimum missing days to flag | 1 day | Yes |
| Include draft entries | No | Yes |
| Count partial-day PTO as filled | Yes | Yes |
| Lookback for late submissions | 0 days (current period only) | Yes |

---

## 5. Data Dependencies

### 5.1 Input Data Sources

| Source | Fields Used |
|--------|------------|
| Worker Position | Worker_ID, Position_ID, Time_Entry_Required, FLSA_Status |
| Worker Employment | Hire_Date, Termination_Date, Employment_Status |
| Work Schedule | Schedule_ID, Scheduled_Days[], Day_Hours |
| Time Entry | Entry_Date, Worker_ID, Hours, Status |
| Time Off | Time_Off_Date, Type, Status (Approved/Pending) |
| Leave of Absence | Start_Date, End_Date, Leave_Type |
| Company Holidays | Holiday_Date, Applicable_Locations[] |
| Pay Period | Start_Date, End_Date, Pay_Group |

### 5.2 Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `CF_Missing_Time_Flag` | Boolean | True if worker has missing time entries |
| `CF_Missing_Time_Days` | Integer | Number of days with missing entries |
| `CF_Missing_Time_Period_Start` | Date | Effective start date used in calculation |
| `CF_Missing_Time_Period_End` | Date | Effective end date used in calculation |

---

## 6. Testing Scenarios

### Test Case 1: Full-Time Worker Missing 2 Days

| Input | Value |
|-------|-------|
| Schedule | Mon–Fri (5 days/week) |
| Pay Period | 2 weeks = 10 scheduled days |
| Submitted Entries | 8 days |
| PTO/Holidays | 0 |

| Expected Output | Value |
|-----------------|-------|
| CF_Missing_Time_Flag | **True** |
| CF_Missing_Time_Days | **2** |

---

### Test Case 2: Worker on Approved PTO (Should NOT Flag)

| Input | Value |
|-------|-------|
| Schedule | Mon–Fri (5 days/week) |
| Pay Period | 2 weeks = 10 scheduled days |
| Submitted Entries | 7 days |
| Approved PTO | 3 days |

| Expected Output | Value |
|-----------------|-------|
| CF_Missing_Time_Flag | **False** |
| CF_Missing_Time_Days | **0** |
| Calculation | Effective Expected = 10 - 3 = 7; Submitted = 7 |

---

### Test Case 3: Mid-Period New Hire

| Input | Value |
|-------|-------|
| Hire Date | Day 6 of pay period |
| Schedule | Mon–Fri (5 days/week) |
| Pay Period | 2 weeks = 10 total scheduled days |
| Expected (from hire) | 5 days (Day 6–10) |
| Submitted Entries | 5 days |

| Expected Output | Value |
|-----------------|-------|
| CF_Missing_Time_Flag | **False** |
| CF_Missing_Time_Days | **0** |

---

### Test Case 4: Part-Time Worker with 3-Day Schedule

| Input | Value |
|-------|-------|
| Schedule | Mon, Wed, Fri (3 days/week) |
| Pay Period | 2 weeks = 6 scheduled days |
| Submitted Entries | 4 days |
| PTO/Holidays | 0 |

| Expected Output | Value |
|-----------------|-------|
| CF_Missing_Time_Flag | **True** |
| CF_Missing_Time_Days | **2** |

---

### Test Case 5: Terminated Mid-Period

| Input | Value |
|-------|-------|
| Termination Date | Day 7 of pay period |
| Schedule | Mon–Fri |
| Expected (through term date) | 5 days (Day 1–5 working days) |
| Submitted Entries | 5 days |

| Expected Output | Value |
|-----------------|-------|
| CF_Missing_Time_Flag | **False** |
| CF_Missing_Time_Days | **0** |

---

### Test Case 6: Exempt Worker (Excluded)

| Input | Value |
|-------|-------|
| FLSA Status | Exempt |
| Time Entry Required | No |

| Expected Output | Value |
|-----------------|-------|
| CF_Missing_Time_Flag | **NULL** (not evaluated) |
| CF_Missing_Time_Days | **NULL** (not evaluated) |

---

## 7. Implementation Notes

### 7.1 Workday Configuration

- **Calculated Field Location**: Custom Calculations > Payroll > Time Validation
- **Evaluation Trigger**: Payroll calculation step (pre-processing)
- **Performance**: Field evaluates per-worker; ensure work schedule lookup is indexed
- **Caching**: Results cached per pay period; invalidated on time entry submission

### 7.2 Integration Points

| System/Process | Integration |
|----------------|-------------|
| Missing Time Entries Report | Primary data field for report rows |
| Dashboard Alert Widget | Count of workers where Flag = True |
| Manager Notifications | Optional alert when Flag = True at payroll close |
| Payroll Pre-check | Block payroll completion if missing time count > threshold |

### 7.3 Limitations

- Does not validate hours entered (only presence of entry)
- Cannot detect time entered against wrong cost center or project
- Relies on accurate work schedule assignment
- Does not account for schedule overrides unless entered in Workday

---

## 8. Change Log

| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | 2026-07-27 | Payroll Team | Initial specification |
