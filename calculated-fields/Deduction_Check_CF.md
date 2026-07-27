# Deduction Exception Check — Calculated Field Specification

## 1. Field Overview

| Attribute | Value |
|-----------|-------|
| **Field Name** | `CF_Deduction_Exception` |
| **Companion Field** | `CF_Deduction_Variance` |
| **Purpose** | Identify deductions that failed, are over/under expected amounts, or are in arrears |
| **Return Type (Exception)** | Text (Exception Type category) |
| **Return Type (Variance)** | Numeric/Currency (signed value) |
| **Used In** | Deduction Exception Report, Composite Dashboard Alert |
| **Data Source** | Payroll Results, Deduction Elections, Arrears Balance |
| **Evaluation Frequency** | Per payroll processing cycle |
| **Owner** | Payroll Operations / Benefits Administration |

---

## 2. Business Logic

### 2.1 Core Detection Logic

The calculated field compares **expected deduction amounts** against **actual deduction amounts** taken during payroll processing, categorizing any discrepancy into a defined exception type.

```
Variance = Actual_Amount - Expected_Amount
Exception_Type = Categorize(Variance, Actual, Expected, Arrears_Balance)
```

### 2.2 Exception Type Definitions

| Exception Type | Condition | Description |
|---------------|-----------|-------------|
| **Failed** | Actual = 0 AND Expected > 0 | Deduction could not be taken (insufficient earnings) |
| **Over-Deducted** | Variance > Threshold | Actual exceeds expected by more than the tolerance |
| **Under-Deducted** | Variance < -Threshold | Actual is less than expected by more than the tolerance (partial take) |
| **Arrears** | Arrears_Balance > 0 | Deduction has an outstanding arrears balance from current or prior periods |
| **None** | All other cases | No exception — deduction processed as expected |

### 2.3 Threshold Configuration

The threshold determines when a variance becomes an exception. Both absolute and percentage thresholds are evaluated; an exception triggers if **either** is exceeded.

| Parameter | Default Value | Description |
|-----------|--------------|-------------|
| Absolute Threshold | $50.00 | Dollar amount variance that triggers exception |
| Percentage Threshold | 10% | Percentage of expected amount that triggers exception |
| Threshold Logic | OR | Exception if absolute OR percentage exceeded |

```
Threshold_Exceeded = 
  ABS(Variance) > Absolute_Threshold 
  OR ABS(Variance) > (Expected_Amount * Percentage_Threshold)
```

---

## 3. Formula

### 3.1 CF_Deduction_Variance (Currency)

```
CF_Deduction_Variance =

  -- Step 1: Get expected amount
  LET Expected_Amount = Deduction_Election.Per_Period_Amount
    -- For percentage-based deductions:
    -- Expected_Amount = Earnings_Subject_To_Deduction * Election_Percentage

  -- Step 2: Get actual amount taken
  LET Actual_Amount = Payroll_Result.Deduction_Amount
    WHERE Deduction_Code = Election.Deduction_Code
      AND Pay_Period = Current_Pay_Period
      AND Worker_ID = Worker.ID

  -- Step 3: Calculate variance
  RETURN Actual_Amount - Expected_Amount
```

### 3.2 CF_Deduction_Exception (Text)

```
CF_Deduction_Exception =

  -- Step 1: Get values
  LET Expected = Deduction_Election.Per_Period_Amount
  LET Actual = Payroll_Result.Deduction_Amount
  LET Variance = Actual - Expected
  LET Arrears_Balance = Deduction_Arrears.Balance_Amount
  LET Abs_Threshold = Configuration.Absolute_Threshold  -- Default: $50
  LET Pct_Threshold = Configuration.Percentage_Threshold  -- Default: 10%

  -- Step 2: Check for failed deduction
  IF Actual = 0 AND Expected > 0 THEN
    RETURN "Failed"

  -- Step 3: Check for over-deduction
  IF Variance > 0 
     AND (Variance > Abs_Threshold OR Variance > Expected * Pct_Threshold) THEN
    RETURN "Over-Deducted"

  -- Step 4: Check for under-deduction
  IF Variance < 0 
     AND (ABS(Variance) > Abs_Threshold OR ABS(Variance) > Expected * Pct_Threshold) THEN
    RETURN "Under-Deducted"

  -- Step 5: Check for arrears
  IF Arrears_Balance > 0 THEN
    RETURN "Arrears"

  -- Step 6: No exception
  RETURN "None"
```

### 3.3 Priority & Evaluation Order

When multiple conditions could apply, the exception type is determined by priority:

| Priority | Exception Type | Rationale |
|----------|---------------|-----------|
| 1 | Failed | Complete failure is most critical |
| 2 | Over-Deducted | Worker overpaid — compliance risk |
| 3 | Under-Deducted | Partial take — potential arrears creation |
| 4 | Arrears | Existing balance from prior periods |
| 5 | None | No action needed |

### 3.4 Special Calculations by Deduction Type

| Deduction Type | Expected Amount Derivation |
|----------------|---------------------------|
| Flat amount | Election.Amount per period |
| Percentage of earnings | Election.Percentage × Subject_Earnings |
| Tiered/formula-based | Benefit plan calculation output |
| Garnishment | Court order amount or percentage (with cap) |
| Loan repayment | Amortized payment amount from loan record |

---

## 4. Deduction Types Covered

### 4.1 Benefit Deductions

| Category | Examples | Notes |
|----------|----------|-------|
| Health/Medical Insurance | Medical PPO, HMO, HDHP | Pre-tax; compare to enrolled plan rate |
| Dental | Dental PPO, DHMO | Pre-tax |
| Vision | Vision plan | Pre-tax |
| Life Insurance | Basic, Supplemental, Dependent | Imputed income for amounts over $50K |
| Disability | STD, LTD | May vary by earnings |
| HSA/FSA | Health Savings, Flexible Spending | Annual election ÷ pay periods |

### 4.2 Retirement Deductions

| Category | Examples | Notes |
|----------|----------|-------|
| 401(k) Pre-Tax | Employee contribution | Percentage-based; subject to IRS limits |
| 401(k) Roth | After-tax Roth contribution | Percentage-based |
| 403(b) | Non-profit retirement | Similar to 401(k) |
| Pension | Defined benefit contribution | May be fixed or percentage |
| Catch-Up | Age 50+ additional | Only for eligible workers |

### 4.3 Involuntary Deductions

| Category | Examples | Notes |
|----------|----------|-------|
| Garnishments | Child support, tax levy, creditor | Court-ordered; priority rules apply |
| Tax Liens | Federal, State | Priority over voluntary deductions |
| Student Loan | Administrative wage garnishment | Federal limits apply |

### 4.4 Voluntary Deductions

| Category | Examples | Notes |
|----------|----------|-------|
| Supplemental Insurance | Accident, Critical Illness, Hospital | After-tax |
| Commuter Benefits | Transit, Parking | Pre-tax limits apply |
| Charitable Contributions | United Way, other | After-tax |
| Union Dues | Membership fees | Per collective agreement |
| Loan Repayments | 401(k) loan, employee advances | Fixed amortized amount |

---

## 5. Conditions & Eligibility

### 5.1 Inclusion Criteria

The calculated field evaluates deductions meeting **all** of the following:

- Worker has an **active deduction election** for the pay period
- Deduction is **scheduled to be taken** in the current pay period (frequency match)
- Payroll has been **calculated or completed** for the period
- Deduction type is within the **covered categories** (Section 4)

### 5.2 Exclusion Criteria

| Exclusion Reason | Logic |
|-----------------|-------|
| One-time adjustment deductions | `Deduction.Frequency = "One-Time"` AND flagged as adjustment |
| Deductions with future start date | `Election.Start_Date > Pay_Period.End_Date` |
| Stopped/ended deductions | `Election.End_Date < Pay_Period.Start_Date` |
| Workers not paid in this period | No payroll result record exists |
| Imputed income (non-cash) | `Deduction.Category = "Imputed"` |

### 5.3 Arrears Handling

| Scenario | Behavior |
|----------|----------|
| New arrears created this period | Exception = "Under-Deducted" (or "Failed" if zero taken) |
| Arrears recovered this period | Do not flag as "Over-Deducted" if recovery matches arrears amount |
| Outstanding arrears from prior period | Exception = "Arrears" (if no other higher-priority exception) |
| Arrears fully recovered | Exception = "None" |

### 5.4 Frequency Considerations

| Pay Frequency | Handling |
|---------------|----------|
| Monthly deduction, bi-weekly pay | Only evaluate in applicable pay periods |
| Bi-weekly deduction, semi-monthly pay | Align to deduction frequency schedule |
| Per-pay-period | Evaluate every period |
| Annual | Evaluate only in designated period |

---

## 6. Data Dependencies

### 6.1 Input Data Sources

| Source | Fields Used |
|--------|------------|
| Deduction Election | Worker_ID, Deduction_Code, Amount, Percentage, Frequency, Start_Date, End_Date |
| Payroll Result (Deductions) | Worker_ID, Deduction_Code, Actual_Amount, Pay_Period |
| Benefit Plan | Plan_Rate, Coverage_Level, Employee_Cost |
| Deduction Arrears | Worker_ID, Deduction_Code, Arrears_Balance, Created_Date |
| Payroll Earnings | Gross_Pay, Subject_Earnings_by_Deduction |
| Worker Employment | Employment_Status, Pay_Group, Pay_Frequency |
| Configuration | Absolute_Threshold, Percentage_Threshold |

### 6.2 Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `CF_Deduction_Exception` | Text | Exception category (Failed, Over-Deducted, Under-Deducted, Arrears, None) |
| `CF_Deduction_Variance` | Currency | Actual minus Expected (negative = under-deducted) |
| `CF_Deduction_Expected` | Currency | Expected deduction amount for reference |
| `CF_Deduction_Actual` | Currency | Actual deduction amount taken |
| `CF_Deduction_Arrears_Balance` | Currency | Current arrears balance (if any) |

---

## 7. Testing Scenarios

### Test Case 1: Normal Deduction — No Exception

| Input | Value |
|-------|-------|
| Deduction | Medical Insurance |
| Expected Amount | $500.00 |
| Actual Amount | $500.00 |
| Arrears Balance | $0.00 |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"None"** |
| CF_Deduction_Variance | **$0.00** |

---

### Test Case 2: Failed Deduction — Insufficient Net Pay

| Input | Value |
|-------|-------|
| Deduction | Medical Insurance |
| Expected Amount | $500.00 |
| Actual Amount | $0.00 |
| Reason | Net pay insufficient after higher-priority deductions |
| Arrears Balance | $500.00 (newly created) |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"Failed"** |
| CF_Deduction_Variance | **-$500.00** |

---

### Test Case 3: Partial Deduction Taken (Under-Deducted)

| Input | Value |
|-------|-------|
| Deduction | 401(k) Contribution |
| Expected Amount | $750.00 (6% of $12,500 gross) |
| Actual Amount | $600.00 |
| Variance | -$150.00 |
| Threshold Check | $150 > $50 (absolute) ✓ |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"Under-Deducted"** |
| CF_Deduction_Variance | **-$150.00** |

---

### Test Case 4: Arrears from Previous Period

| Input | Value |
|-------|-------|
| Deduction | Dental Insurance |
| Expected Amount | $75.00 |
| Actual Amount | $75.00 (current period taken correctly) |
| Arrears Balance | $75.00 (from prior failed period) |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"Arrears"** |
| CF_Deduction_Variance | **$0.00** |
| Note | Current period is fine, but outstanding balance exists |

---

### Test Case 5: Over-Deducted (Arrears Recovery Exceeds Expected)

| Input | Value |
|-------|-------|
| Deduction | Vision Insurance |
| Expected Amount | $25.00 |
| Actual Amount | $50.00 (includes $25 arrears recovery) |
| Arrears Balance | $0.00 (recovered) |
| Variance | +$25.00 |
| Threshold Check | $25 < $50 (absolute) but 100% > 10% ✓ |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"None"** |
| CF_Deduction_Variance | **$25.00** |
| Note | Arrears recovery is excluded from over-deduction check |

---

### Test Case 6: Garnishment Within Tolerance

| Input | Value |
|-------|-------|
| Deduction | Child Support Garnishment |
| Expected Amount | $800.00 |
| Actual Amount | $780.00 |
| Variance | -$20.00 |
| Threshold Check | $20 < $50 (absolute) AND 2.5% < 10% |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"None"** |
| CF_Deduction_Variance | **-$20.00** |
| Note | Below both thresholds — acceptable variance |

---

### Test Case 7: Percentage-Based Deduction with Earnings Change

| Input | Value |
|-------|-------|
| Deduction | 401(k) at 10% |
| Normal Gross | $10,000 → Expected $1,000 |
| Actual Gross (overtime) | $12,500 → Actual $1,250 |
| Variance | +$250.00 |

| Expected Output | Value |
|-----------------|-------|
| CF_Deduction_Exception | **"None"** |
| CF_Deduction_Variance | **$0.00** |
| Note | Expected is recalculated based on actual subject earnings; no true variance |

---

## 8. Implementation Notes

### 8.1 Workday Configuration

- **Calculated Field Location**: Custom Calculations > Payroll > Deduction Validation
- **Evaluation Trigger**: Post-payroll calculation (after all deductions processed)
- **Performance**: Evaluates per-worker per-deduction; batch processing recommended
- **Caching**: Results cached per completed payroll run

### 8.2 Threshold Administration

| Setting | Location | Access |
|---------|----------|--------|
| Absolute Threshold ($) | Tenant Configuration > Payroll > Exception Thresholds | Payroll Admin |
| Percentage Threshold (%) | Tenant Configuration > Payroll > Exception Thresholds | Payroll Admin |
| Per-Deduction Override | Deduction Definition > Exception Settings | Benefits Admin |

Thresholds can be overridden at the deduction level (e.g., garnishments may use $0 threshold for zero tolerance).

### 8.3 Integration Points

| System/Process | Integration |
|----------------|-------------|
| Deduction Exception Report | Primary data field for report rows; grouped by exception type |
| Dashboard Alert Widget | Count of exceptions by type; total variance amount |
| Benefits Team Notification | Alert when "Failed" count exceeds threshold |
| Payroll Audit Trail | Exception records logged for compliance |
| Arrears Management | Links to arrears recovery scheduling |

### 8.4 Limitations

- Does not evaluate deductions that were intentionally stopped mid-period by admin action
- Percentage-based deductions require accurate subject earnings data to compute expected
- Court-ordered garnishment priority calculations handled upstream (not in this CF)
- Does not account for annual IRS limit exhaustion mid-year (separate CF recommended)
- Retroactive adjustments from prior periods may create false positives until reconciled

---

## 9. Related Calculated Fields

| Field | Relationship |
|-------|-------------|
| `CF_Payroll_Status` | Overall payroll status may incorporate deduction exception counts |
| `CF_Missing_Time_Flag` | Both feed into composite dashboard alerts |
| `CF_Tax_Exception` | Tax exceptions evaluated separately with own thresholds |

---

## 10. Change Log

| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | 2026-07-27 | Payroll Team | Initial specification |
