# Overtime Hours Calculated Field

## 1. Field Overview

| Attribute | Value |
|-----------|-------|
| **Field Name** | `CF_Overtime_Hours` |
| **Purpose** | Calculate overtime hours exceeding standard weekly/daily thresholds for non-exempt workers |
| **Return Type** | Numeric (Decimal, 2 places) |
| **Used In** | Overtime Report, Dashboard KPI, Payroll Cost Report |
| **Owner** | Payroll Operations |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-24 |

---

## 2. Business Logic

### 2.1 Standard Weekly Overtime

- **Threshold:** 40 hours per workweek (Sunday–Saturday)
- **Calculation:** Overtime = Total Hours Worked − 40 (if positive, else 0)
- **Rate:** 1.5× regular hourly rate

### 2.2 Daily Overtime (California / State-Specific Rules)

| Rule | Threshold | Rate |
|------|-----------|------|
| Daily Overtime | Hours > 8 in a single day | 1.5× |
| Daily Double-Time | Hours > 12 in a single day | 2.0× |
| 7th Consecutive Day (first 8 hrs) | Any hours on 7th day | 1.5× |
| 7th Consecutive Day (over 8 hrs) | Hours > 8 on 7th day | 2.0× |

### 2.3 Eligible Time Types

| Time Type | Included in OT Calculation |
|-----------|---------------------------|
| Regular Hours | ✅ Yes |
| Training Hours | ✅ Yes |
| Travel Time (non-commute) | ✅ Yes |
| PTO / Vacation | ❌ No |
| Sick Leave | ❌ No |
| Holiday (Paid) | ❌ No |
| Jury Duty | ❌ No |
| Bereavement | ❌ No |

### 2.4 Worker Eligibility

| Worker Classification | OT Eligible |
|----------------------|-------------|
| Non-Exempt (Full-Time) | ✅ Yes — 40 hr/week threshold |
| Non-Exempt (Part-Time) | ✅ Yes — Configurable threshold (see §5) |
| Exempt (Salaried) | ❌ No |
| Contractor / 1099 | ❌ No |
| Intern (Non-Exempt) | ✅ Yes — 40 hr/week threshold |

---

## 3. Formula

### 3.1 Weekly Overtime Calculation

```
// Workday Calculated Field Expression
Weekly_OT_Hours = 
  IF(
    Worker.Exempt_Status = "Non-Exempt",
    MAX(0, SUM(Time_Entry.Reported_Hours 
               WHERE Time_Entry.Time_Type IN ("Regular", "Training", "Travel")
               AND Time_Entry.Week = Current_Pay_Period_Week) - Weekly_Threshold),
    0
  )
```

### 3.2 Daily Overtime Calculation (State-Specific)

```
// Daily OT for states with daily overtime rules (e.g., California, Alaska, Nevada, Colorado)
Daily_OT_Hours = 
  IF(
    Worker.Exempt_Status = "Non-Exempt"
    AND Worker.Work_State IN ("CA", "AK", "NV", "CO"),
    SUM_OVER_DAYS(
      MAX(0, MIN(Daily_Hours - 8, 4))  // Hours between 8-12 at 1.5x
    ),
    0
  )

Daily_Double_Time_Hours = 
  IF(
    Worker.Exempt_Status = "Non-Exempt"
    AND Worker.Work_State IN ("CA", "AK", "NV", "CO"),
    SUM_OVER_DAYS(
      MAX(0, Daily_Hours - 12)  // Hours beyond 12 at 2.0x
    ),
    0
  )
```

### 3.3 Composite Overtime Calculation

```
// Final OT hours — use the GREATER of weekly or daily method to avoid double-counting
CF_Overtime_Hours = 
  IF(
    Worker.Work_State IN ("CA", "AK", "NV", "CO"),
    MAX(Weekly_OT_Hours, Daily_OT_Hours + Daily_Double_Time_Hours),
    Weekly_OT_Hours
  )
```

### 3.4 Pseudo-Logic Summary

```
FUNCTION Calculate_Overtime(Worker_ID, Pay_Period_Week):
    
    // Step 1: Check eligibility
    IF Worker.Exempt_Status ≠ "Non-Exempt" THEN RETURN 0
    
    // Step 2: Get eligible hours
    Eligible_Hours[] = GET Time_Entries 
        WHERE Worker = Worker_ID
        AND Week = Pay_Period_Week
        AND Time_Type IN ("Regular", "Training", "Travel")
    
    // Step 3: Calculate weekly OT
    Total_Weekly = SUM(Eligible_Hours)
    Threshold = GET_Threshold(Worker)  // 40 for FT, configurable for PT
    Weekly_OT = MAX(0, Total_Weekly - Threshold)
    
    // Step 4: Calculate daily OT (if applicable)
    IF Worker.Work_State requires daily OT THEN
        Daily_OT = 0
        Double_Time = 0
        FOR EACH day IN Pay_Period_Week:
            Day_Hours = SUM(Eligible_Hours WHERE Date = day)
            Daily_OT += MAX(0, MIN(Day_Hours - 8, 4))
            Double_Time += MAX(0, Day_Hours - 12)
        END FOR
        RETURN MAX(Weekly_OT, Daily_OT + Double_Time)
    END IF
    
    // Step 5: Return weekly OT for non-daily-OT states
    RETURN Weekly_OT
END FUNCTION
```

---

## 4. Conditions & Exceptions

### 4.1 Exempt Worker Exclusion

| Condition | Action |
|-----------|--------|
| `Worker.Exempt_Status = "Exempt"` | Return 0; skip all OT calculation |
| `Worker.Exempt_Status = "Non-Exempt"` | Proceed with calculation |
| Exempt status changes mid-period | Prorate based on status effective date |

### 4.2 Part-Time Worker Thresholds

| Employment Type | Weekly Threshold | Notes |
|----------------|-----------------|-------|
| Full-Time (≥ 35 hrs scheduled) | 40 hours | Standard FLSA |
| Part-Time (< 35 hrs scheduled) | 40 hours | FLSA still applies at 40 hrs |
| Part-Time (state-specific) | Configurable | Some states/employers use lower threshold |

> **Note:** Under FLSA, part-time workers are still entitled to OT after 40 hours/week regardless of scheduled hours. State or contractual rules may differ.

### 4.3 Holiday Hours Handling

- Holiday hours are **excluded** from OT-eligible hours
- If a worker works on a holiday, those hours are categorized as "Holiday Worked" and **are** included
- Holiday premium pay is calculated separately from OT

### 4.4 State-Specific Rules

| State | Rule | Implementation |
|-------|------|----------------|
| **California** | Daily OT > 8 hrs; Double-time > 12 hrs; 7th consecutive day | Full daily OT logic |
| **Alaska** | Daily OT > 8 hrs | Daily OT logic (no double-time) |
| **Nevada** | Daily OT > 8 hrs (if rate < 1.5× minimum wage) | Conditional daily OT |
| **Colorado** | Daily OT > 12 hrs | Daily OT with 12-hr threshold |
| **All Other States** | Weekly OT > 40 hrs only | Standard weekly calculation |

### 4.5 Edge Cases

| Scenario | Handling |
|----------|----------|
| Worker transfers states mid-week | Apply rules of state where hours were worked |
| Multiple positions / jobs | Aggregate hours across all positions for single employer |
| On-call hours | Include only if worker is required to remain on premises |
| Meal/rest breaks (auto-deducted) | Use net reported hours after deductions |
| Retroactive time corrections | Recalculate OT for affected week(s) |
| Compressed workweek (4×10) | Daily OT still applies per state rules |

---

## 5. Configuration

### 5.1 Data Source

| Parameter | Value |
|-----------|-------|
| **Primary Source** | Workday Time Tracking |
| **Business Object** | `Time_Tracking_Entry` |
| **Aggregation Level** | Weekly (per pay period week) |
| **Refresh Frequency** | Real-time (on time entry submission) |

### 5.2 Input Fields

| Field | Source | Description |
|-------|--------|-------------|
| `Reported_Hours` | Time Tracking Entry | Hours reported per day per worker |
| `Time_Type` | Time Tracking Entry | Category of time (Regular, PTO, etc.) |
| `Worker.Exempt_Status` | Worker Profile | FLSA exempt/non-exempt classification |
| `Worker.Work_State` | Worker Profile > Primary Work Location | State for determining OT rules |
| `Worker.Employment_Type` | Worker Profile | Full-Time, Part-Time |
| `Time_Entry.Date` | Time Tracking Entry | Date of hours worked |
| `Pay_Period.Week_Start` | Payroll Calendar | Week boundary for aggregation |

### 5.3 Configurable Thresholds

| Parameter | Default Value | Configuration Location |
|-----------|---------------|----------------------|
| `WEEKLY_OT_THRESHOLD` | 40 | Tenant Setup > Payroll > OT Rules |
| `DAILY_OT_THRESHOLD` | 8 | Tenant Setup > Payroll > OT Rules |
| `DAILY_DOUBLE_TIME_THRESHOLD` | 12 | Tenant Setup > Payroll > OT Rules |
| `DAILY_OT_STATES` | CA, AK, NV, CO | Tenant Setup > Payroll > OT Rules |
| `PT_WEEKLY_THRESHOLD` | 40 | Tenant Setup > Payroll > OT Rules |
| `ELIGIBLE_TIME_TYPES` | Regular, Training, Travel | Tenant Setup > Payroll > OT Rules |

### 5.4 Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `CF_Overtime_Hours` | Decimal (2) | Total OT hours for the period |
| `CF_Overtime_Type` | Text | "Weekly", "Daily", or "Double-Time" |
| `CF_OT_Eligible` | Boolean | Whether worker is eligible for OT |

---

## 6. Testing Scenarios

### 6.1 Unit Test Cases

| # | Scenario | Input | Expected Output | Pass Criteria |
|---|----------|-------|-----------------|---------------|
| TC-01 | Exactly 40 hours (no OT) | Non-exempt, 40.00 hrs/week, Texas | `CF_Overtime_Hours = 0.00` | No OT generated |
| TC-02 | 45 hours weekly (5 OT) | Non-exempt, 45.00 hrs/week, Texas | `CF_Overtime_Hours = 5.00` | Standard weekly OT |
| TC-03 | 38 hours (under threshold) | Non-exempt, 38.00 hrs/week, Texas | `CF_Overtime_Hours = 0.00` | No OT below 40 |
| TC-04 | 10-hour day in California | Non-exempt, 10 hrs on Monday, 30 hrs rest of week (total 40), CA | `CF_Overtime_Hours = 2.00` | Daily OT: 10 − 8 = 2 |
| TC-05 | 14-hour day in California | Non-exempt, 14 hrs on Monday, 26 hrs rest of week, CA | `CF_Overtime_Hours = 6.00` | Daily OT: 4 hrs (8–12) + Double-time: 2 hrs (12–14) |
| TC-06 | Exempt worker with 50 hours | Exempt, 50.00 hrs/week | `CF_Overtime_Hours = 0.00` | Exempt exclusion |
| TC-07 | PTO hours excluded | Non-exempt, 35 Regular + 8 PTO = 43 total, Texas | `CF_Overtime_Hours = 0.00` | PTO not counted; 35 < 40 |
| TC-08 | Part-time over 40 | Non-exempt PT, 42 hrs/week, Texas | `CF_Overtime_Hours = 2.00` | FLSA applies at 40 |
| TC-09 | Multiple days over 8 in CA | Non-exempt, 9+9+9+9+4 = 40 hrs, CA | `CF_Overtime_Hours = 4.00` | Daily OT: 4 × 1 hr |
| TC-10 | Holiday worked | Non-exempt, 40 Regular + 8 Holiday Worked, Texas | `CF_Overtime_Hours = 8.00` | Holiday Worked counts |

### 6.2 Integration Test Cases

| # | Scenario | Validation |
|---|----------|-----------|
| IT-01 | OT hours flow to Overtime Report | CF value appears correctly in report output |
| IT-02 | OT hours feed Dashboard KPI | KPI widget displays correct aggregate OT |
| IT-03 | State rule change mid-period | Recalculation triggered, correct split applied |
| IT-04 | Retroactive time edit | OT recalculated for affected week |
| IT-05 | Bulk time entry (import) | All entries processed, OT computed correctly |

### 6.3 UAT Acceptance Criteria

- [ ] Non-exempt workers with >40 hrs/week show correct OT hours
- [ ] Exempt workers never show OT regardless of hours
- [ ] California workers see daily OT calculated correctly
- [ ] PTO/holiday hours are properly excluded from OT calculation
- [ ] Part-time workers accumulate OT at 40-hour threshold
- [ ] Dashboard KPI matches sum of individual worker OT values
- [ ] Threshold configuration changes take effect on next calculation

---

## 7. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| Time Tracking module | Data Source | Must have approved/submitted time entries |
| Worker Profile | Data Source | Exempt status must be current |
| Payroll Calendar | Configuration | Week boundaries defined |
| State OT Rules table | Configuration | Maintained by Payroll Admin |
| CF_Payroll_Status | Calculated Field | Used to determine if payroll is in processing |

---

## 8. Performance Considerations

- **Indexing:** Ensure `Time_Tracking_Entry` is indexed on `Worker_ID` + `Date`
- **Caching:** Weekly aggregation can be cached after time period closes
- **Batch Processing:** For pay period close, run OT calculation in batch for all non-exempt workers
- **Expected Volume:** ~5,000 non-exempt workers × 52 weeks = ~260,000 calculations/year

---

## 9. Change Log

| Date | Version | Author | Change Description |
|------|---------|--------|-------------------|
| 2026-07-24 | 1.0 | Payroll Team | Initial specification |
