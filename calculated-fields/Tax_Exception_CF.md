# Tax Exception Detection — Calculated Field Specification

## 1. Field Overview

| Attribute | Value |
|-----------|-------|
| **Field Name** | `CF_Tax_Exception` |
| **Companion Field** | `CF_Tax_Variance` |
| **Purpose** | Identify tax withholding exceptions, mismatches, and missing elections across federal, state, and local tax types |
| **Return Type (Exception)** | Text (Exception Type category) |
| **Return Type (Variance)** | Currency (signed value — difference between actual and expected withholding) |
| **Used In** | Tax Exception Report, Dashboard Alert |
| **Data Source** | Payroll Results, Tax Elections (W-4 / State Forms), Worker Profile, Tax Authority Tables |
| **Evaluation Frequency** | Per payroll processing cycle |
| **Owner** | Payroll Operations / Tax Compliance |
| **Version** | 1.0 |
| **Last Updated** | 2026-07-28 |

---

## 2. Business Logic

### 2.1 Core Detection Logic

The calculated field evaluates each worker's tax withholding results against expected amounts and election status, categorizing any discrepancy into a defined exception type.

```
Variance = Actual_Tax_Withheld - Expected_Tax_Withholding
Exception_Type = Categorize(Variance, Elections, Filing_Status, Work_Location, Form_Dates)
```

### 2.2 Exception Type Definitions

| Exception Type | Condition | Description |
|---------------|-----------|-------------|
| **No Withholding** | Actual = 0 AND Gross > 0 AND Status ≠ Exempt | Worker has zero tax withheld when withholding was expected |
| **Excess Withholding** | Variance > Threshold | Tax amount exceeds expected rate by more than the configured tolerance |
| **Missing Tax Election** | No W-4 or state form on file | Worker has no tax election record for an applicable tax authority |
| **Multi-State Issue** | Work_State ≠ Resident_State AND no reciprocity agreement | Worker works in one state and resides in another without proper allocation |
| **Expired Tax Form** | Tax election form past renewal date (>1 year for exempt; per policy otherwise) | Tax election form requires renewal |
| **None** | All checks pass | No exception detected |

### 2.3 Threshold Configuration

Both absolute and percentage thresholds are evaluated; an exception triggers if **either** is exceeded.

| Parameter | Default Value | Description |
|-----------|--------------|-------------|
| Absolute Threshold | $100.00 | Dollar amount variance that triggers exception |
| Percentage Threshold | 5% | Percentage of expected withholding that triggers exception |
| Threshold Logic | OR | Exception if absolute OR percentage exceeded |

```
Threshold_Exceeded =
  ABS(Variance) > Absolute_Threshold
  OR ABS(Variance) > (Expected_Withholding * Percentage_Threshold)
```

---

## 3. Formula

### 3.1 CF_Tax_Variance (Currency)

```
CF_Tax_Variance =

  -- Step 1: Get expected withholding
  LET Expected_Withholding = Calculate_Expected_Tax(
    Gross_Pay,
    Taxable_Wages,          -- Gross minus pre-tax deductions
    Filing_Status,
    Allowances_or_Credits,  -- W-4 Step 3 credits / legacy allowances
    Additional_Withholding, -- W-4 Step 4(c) additional amount
    Tax_Authority,          -- Federal, State, Local
    Pay_Frequency
  )

  -- Step 2: Get actual withholding from payroll result
  LET Actual_Withholding = Payroll_Result.Tax_Amount
    WHERE Tax_Code = Tax_Authority.Code
      AND Pay_Period = Current_Pay_Period
      AND Worker_ID = Worker.ID

  -- Step 3: Calculate variance
  RETURN Actual_Withholding - Expected_Withholding
```

### 3.2 CF_Tax_Exception (Text)

```
CF_Tax_Exception =

  -- Priority 1: Check for missing tax election
  IF Tax_Election.Record IS NULL
     AND Tax_Authority.Is_Applicable(Worker) = TRUE THEN
    RETURN "Missing Tax Election"

  -- Priority 2: Check for expired tax form
  IF Tax_Election.Filing_Status = "Exempt"
     AND Tax_Election.Effective_Date < Current_Year_Start THEN
    RETURN "Expired Tax Form"
  IF Tax_Election.Effective_Date IS NULL
     OR DATEDIFF(YEAR, Tax_Election.Effective_Date, Current_Date) > 1 THEN
    RETURN "Expired Tax Form"

  -- Priority 3: Check for multi-state issue
  IF Worker.Work_State != Worker.Resident_State
     AND Reciprocity_Agreement(Worker.Work_State, Worker.Resident_State) = FALSE
     AND Worker.State_Tax_Allocation IS NULL THEN
    RETURN "Multi-State Issue"

  -- Priority 4: Check for no withholding
  IF Actual_Withholding = 0
     AND Gross_Pay > 0
     AND Tax_Election.Filing_Status != "Exempt" THEN
    RETURN "No Withholding"

  -- Priority 5: Check for excess withholding
  LET Variance = Actual_Withholding - Expected_Withholding
  LET Abs_Threshold = Configuration.Absolute_Threshold   -- Default: $100
  LET Pct_Threshold = Configuration.Percentage_Threshold  -- Default: 5%

  IF Variance > 0
     AND (Variance > Abs_Threshold OR Variance > Expected_Withholding * Pct_Threshold) THEN
    RETURN "Excess Withholding"

  -- Priority 6: Check for under-withholding (informational)
  IF Variance < 0
     AND (ABS(Variance) > Abs_Threshold OR ABS(Variance) > Expected_Withholding * Pct_Threshold) THEN
    RETURN "Under Withholding"

  -- Priority 7: No exception
  RETURN "None"
```

### 3.3 Priority & Evaluation Order

When multiple conditions could apply, the exception type is determined by priority:

| Priority | Exception Type | Rationale |
|----------|---------------|-----------|
| 1 | Missing Tax Election | Compliance — no basis for correct withholding |
| 2 | Expired Tax Form | Regulatory — exempt status must be renewed annually |
| 3 | Multi-State Issue | Compliance risk — incorrect state allocation |
| 4 | No Withholding | Worker may owe significant taxes at year-end |
| 5 | Excess Withholding | Over-withholding affects worker take-home pay |
| 6 | Under Withholding | Worker may owe balance at year-end |
| 7 | None | No action needed |

### 3.4 Expected Tax Calculation Logic

```
FUNCTION Calculate_Expected_Tax(Gross_Pay, Taxable_Wages, Filing_Status,
                                Credits, Additional, Tax_Authority, Frequency):

  -- Annualize taxable wages
  LET Annual_Wages = Taxable_Wages * Periods_Per_Year(Frequency)

  -- Look up tax bracket
  LET Tax_Table = Tax_Authority.Get_Table(Filing_Status, Tax_Year)
  LET Annual_Tax = Apply_Progressive_Brackets(Annual_Wages, Tax_Table)

  -- Apply credits / allowances
  LET Annual_Tax = Annual_Tax - Credits

  -- De-annualize
  LET Per_Period_Tax = Annual_Tax / Periods_Per_Year(Frequency)

  -- Add any additional withholding
  LET Per_Period_Tax = Per_Period_Tax + Additional

  -- Floor at zero
  RETURN MAX(0, Per_Period_Tax)

END FUNCTION
```

---

## 4. Tax Types Covered

### 4.1 Federal Income Tax

| Attribute | Detail |
|-----------|--------|
| Tax Authority | IRS |
| Election Form | W-4 (2020+ version or legacy) |
| Key Fields | Filing Status, Step 2 (Multiple Jobs), Step 3 (Credits), Step 4(a) (Other Income), Step 4(b) (Deductions), Step 4(c) (Extra Withholding) |
| Rate Source | IRS Publication 15-T tax tables |
| Exempt Handling | Valid only through Feb 15 of following year; must renew annually |
| Supplemental Rate | 22% flat (or aggregate method if combined with regular pay) |

### 4.2 State Income Tax

| Attribute | Detail |
|-----------|--------|
| Election Form | State-specific W-4 equivalent (e.g., CA DE-4, NY IT-2104) |
| Key Fields | Filing Status, Allowances/Exemptions (varies by state) |
| Rate Source | State tax authority published tables |
| No-Income-Tax States | AK, FL, NV, NH, SD, TN, TX, WA, WY — no state withholding expected |
| Reciprocity States | See §5.2 for reciprocity agreement table |

### 4.3 Local / City Tax

| Attribute | Detail |
|-----------|--------|
| Applicability | City/county/school district taxes (e.g., NYC, Philadelphia, Ohio municipalities) |
| Election Form | Local withholding certificate (varies) |
| Rate Source | Local tax authority published rates |
| Key Consideration | Some localities tax residents only, others tax all workers in jurisdiction |

### 4.4 Social Security (OASDI)

| Attribute | Detail |
|-----------|--------|
| Rate | 6.2% employee / 6.2% employer |
| Wage Base (2026) | $176,100 (subject to annual adjustment) |
| Exception Logic | IF YTD_SS_Wages ≥ Wage_Base THEN expected withholding = 0 for remaining periods |
| Validation | Flag if SS tax withheld after worker has exceeded annual wage base |
| Over-Collection | Exception = "Excess Withholding" if SS tax taken after wage base reached |

### 4.5 Medicare

| Attribute | Detail |
|-----------|--------|
| Rate | 1.45% employee / 1.45% employer |
| Additional Medicare | 0.9% on wages exceeding $200,000 (Single) / $250,000 (MFJ) |
| Wage Base | No cap — applies to all wages |
| Validation | Verify additional Medicare kicks in at threshold; flag if missing |

---

## 5. Special Scenarios

### 5.1 Exempt Status Workers

| Rule | Detail |
|------|--------|
| Federal Exempt | W-4 claiming exemption valid only for the calendar year filed |
| Renewal Deadline | New exempt W-4 must be filed by **February 15** each year |
| Auto-Expiration | If not renewed, withholding reverts to Single with no adjustments |
| High-Income Check | If worker claims exempt but YTD_Gross > $50,000, flag as "No Withholding" for review |
| State Exempt | Follows state-specific rules; some states do not allow exempt status |

### 5.2 Multi-State / Reciprocity

Reciprocity agreements allow workers to be taxed only in their state of residence:

| Work State | Resident State(s) with Reciprocity |
|------------|-------------------------------------|
| DC | All states |
| IL | IA, KY, MI, WI |
| IN | KY, MI, OH, PA, WI |
| IA | IL |
| KY | IL, IN, MI, OH, VA, WV, WI |
| MD | DC, PA, VA, WV |
| MI | IL, IN, KY, MN, OH, WI |
| MN | MI, ND |
| MT | ND |
| NJ | PA |
| ND | MN, MT |
| OH | IN, KY, MI, PA, WV |
| PA | IN, MD, NJ, OH, VA, WV |
| VA | DC, KY, MD, PA, WV |
| WV | KY, MD, OH, PA, VA |
| WI | IL, IN, KY, MI, MN |

**Logic:**
```
IF Worker.Work_State != Worker.Resident_State THEN
  IF Reciprocity_Table.Has_Agreement(Work_State, Resident_State) THEN
    -- Withhold only in Resident_State
    Exception = "None" (for Work_State)
  ELSE
    -- Must withhold in BOTH states (or allocate)
    IF Worker.State_Tax_Allocation IS NULL THEN
      Exception = "Multi-State Issue"
    END IF
  END IF
END IF
```

### 5.3 Supplemental Pay Tax Rates

| Pay Type | Federal Rate | State Rate |
|----------|-------------|------------|
| Bonus | 22% flat (≤ $1M) / 37% (> $1M) | Varies by state |
| Commission | 22% flat or aggregate method | Varies by state |
| Severance | 22% flat | Varies by state |
| Stock Options / RSU | 22% flat for federal; state varies | Varies by state |

**Validation:** When supplemental pay is identified, expected withholding uses supplemental rate tables rather than standard W-4 withholding tables.

### 5.4 Pre-Tax Deduction Impact

| Deduction Type | Reduces Federal Taxable | Reduces State Taxable | Reduces SS/Medicare Taxable |
|---------------|------------------------|-----------------------|-----------------------------|
| 401(k) Pre-Tax | ✅ Yes | ✅ Yes (most states) | ❌ No |
| HSA | ✅ Yes | ✅ Yes (except NJ, CA) | ✅ Yes |
| FSA (Health/Dependent Care) | ✅ Yes | ✅ Yes | ✅ Yes |
| Traditional IRA (payroll) | ✅ Yes | ✅ Yes | ❌ No |
| Commuter Benefits | ✅ Yes | Varies | ✅ Yes |

**Validation:** Expected withholding must use **taxable wages** (gross minus applicable pre-tax deductions) — not gross pay — for the specific tax type.

### 5.5 Year-End Social Security Cap

```
FUNCTION Check_SS_Cap(Worker_ID, Pay_Period):

  LET YTD_SS_Wages = SUM(Payroll_Results.SS_Taxable_Wages
                         WHERE Worker = Worker_ID
                         AND Tax_Year = Current_Year
                         AND Pay_Period <= Current_Pay_Period)

  LET Current_Period_Wages = Payroll_Result.SS_Taxable_Wages
  LET Wage_Base = Tax_Configuration.SS_Wage_Base  -- e.g., $176,100

  IF YTD_SS_Wages >= Wage_Base THEN
    -- Worker already hit cap; no SS tax expected
    IF Actual_SS_Tax > 0 THEN
      RETURN "Excess Withholding"   -- SS tax taken after cap
    ELSE
      RETURN "None"                 -- Correctly stopped
    END IF

  ELSE IF (YTD_SS_Wages + Current_Period_Wages) > Wage_Base THEN
    -- Partial period — only tax wages up to the cap
    LET Taxable_This_Period = Wage_Base - YTD_SS_Wages
    LET Expected_SS = Taxable_This_Period * 0.062
    -- Compare Expected_SS to Actual and apply threshold
  END IF

END FUNCTION
```

---

## 6. Conditions & Eligibility

### 6.1 Inclusion Criteria

The calculated field evaluates tax withholding for workers meeting **all** of the following:

- Worker has an **active payroll result** for the pay period
- Worker is classified as a **W-2 employee** (not 1099 contractor)
- Payroll has been **calculated or completed** for the period
- Tax authority is **applicable** to the worker's work/residence location

### 6.2 Exclusion Criteria

| Exclusion Reason | Logic |
|-----------------|-------|
| 1099 / Contractor | `Worker.Worker_Type = "Contingent"` — no tax withholding |
| Workers in no-income-tax states | State tax exceptions not generated for AK, FL, NV, NH, SD, TN, TX, WA, WY |
| Zero-pay period | `Gross_Pay = 0` — no withholding expected |
| Third-party sick pay | Withholding handled by third party; exclude from validation |
| Workers on unpaid leave | No payroll result generated |

### 6.3 Tax Authority Applicability

| Tax Type | Applicable When |
|----------|----------------|
| Federal Income Tax | All W-2 employees with gross pay > 0 |
| State Income Tax | Worker's work state or residence state has income tax |
| Local Tax | Worker's work location has local/city tax ordinance |
| Social Security | All W-2 employees until wage base reached |
| Medicare | All W-2 employees (no wage base cap) |

---

## 7. Data Dependencies

### 7.1 Input Data Sources

| Source | Fields Used |
|--------|------------|
| Tax Election (W-4) | Worker_ID, Filing_Status, Credits, Additional_Withholding, Exempt_Flag, Effective_Date |
| State Tax Election | Worker_ID, State, Filing_Status, Allowances, Effective_Date |
| Payroll Result (Taxes) | Worker_ID, Tax_Code, Tax_Amount, Taxable_Wages, Pay_Period |
| Worker Profile | Worker_ID, Work_State, Resident_State, Worker_Type, Employment_Status |
| Payroll Earnings | Gross_Pay, Taxable_Wages_Federal, Taxable_Wages_State, SS_Taxable_Wages |
| YTD Balances | YTD_Gross, YTD_Federal_Tax, YTD_SS_Wages, YTD_Medicare_Wages |
| Tax Tables | Federal/State brackets, rates, standard deductions by filing status |
| Reciprocity Table | Work_State, Resident_State, Agreement_Flag |
| Configuration | Absolute_Threshold, Percentage_Threshold, SS_Wage_Base |

### 7.2 Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `CF_Tax_Exception` | Text | Exception category (No Withholding, Excess Withholding, Missing Tax Election, Multi-State Issue, Expired Tax Form, Under Withholding, None) |
| `CF_Tax_Variance` | Currency | Actual minus Expected withholding (positive = over-withheld) |
| `CF_Tax_Expected` | Currency | Expected withholding amount for reference |
| `CF_Tax_Actual` | Currency | Actual withholding amount from payroll result |
| `CF_Tax_Type` | Text | Tax type evaluated (Federal, State, Local, SS, Medicare) |
| `CF_Tax_Authority` | Text | Specific tax authority code |

---

## 8. Testing Scenarios

### Test Case 1: Normal Federal Withholding — No Exception

| Input | Value |
|-------|-------|
| Tax Type | Federal Income Tax |
| Filing Status | Married Filing Jointly |
| Gross Pay | $5,000.00 (bi-weekly) |
| Pre-Tax Deductions | $500.00 (401k) |
| Taxable Wages | $4,500.00 |
| Expected Withholding | $380.00 |
| Actual Withholding | $380.00 |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"None"** |
| CF_Tax_Variance | **$0.00** |

---

### Test Case 2: No Federal Withholding — Non-Exempt Worker

| Input | Value |
|-------|-------|
| Tax Type | Federal Income Tax |
| Filing Status | Single |
| Gross Pay | $4,000.00 (bi-weekly) |
| Actual Withholding | $0.00 |
| Exempt Status | Not Exempt |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"No Withholding"** |
| CF_Tax_Variance | **-$468.00** |
| Note | Worker is not exempt but has zero federal tax withheld |

---

### Test Case 3: Worker Claiming Exempt with High Income

| Input | Value |
|-------|-------|
| Tax Type | Federal Income Tax |
| Filing Status | Exempt |
| W-4 Effective Date | 2025-02-10 |
| Current Date | 2026-07-28 |
| YTD Gross Pay | $85,000.00 |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"Expired Tax Form"** |
| CF_Tax_Variance | **N/A** |
| Note | Exempt W-4 filed in 2025 has expired; was not renewed by Feb 15, 2026 |

---

### Test Case 4: Multi-State — NY Worker Living in NJ

| Input | Value |
|-------|-------|
| Tax Type | State Income Tax |
| Work State | NY |
| Resident State | NJ |
| Reciprocity Agreement | **No** (NY–NJ has no reciprocity) |
| State Tax Allocation | NULL |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"Multi-State Issue"** |
| CF_Tax_Variance | **$0.00** |
| Note | Worker must file in both NY and NJ; no allocation configured in Workday |

---

### Test Case 5: Worker Exceeding Social Security Wage Base

| Input | Value |
|-------|-------|
| Tax Type | Social Security |
| YTD SS Wages | $175,000.00 |
| Current Period SS Taxable Wages | $5,000.00 |
| SS Wage Base | $176,100.00 |
| Expected SS Tax | ($176,100 − $175,000) × 6.2% = $68.20 |
| Actual SS Tax | $310.00 ($5,000 × 6.2%) |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"Excess Withholding"** |
| CF_Tax_Variance | **+$241.80** |
| Note | SS tax should have been capped; only $1,100 of wages are taxable this period |

---

### Test Case 6: New Hire with No Tax Elections

| Input | Value |
|-------|-------|
| Tax Type | Federal Income Tax |
| W-4 on File | **None** |
| Hire Date | 2026-07-15 |
| First Pay Period | 2026-07-28 |
| Gross Pay | $3,500.00 |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"Missing Tax Election"** |
| CF_Tax_Variance | **N/A** |
| Note | New hire has not submitted W-4; default withholding (Single, no adjustments) may apply but election is still required |

---

### Test Case 7: Reciprocity — IL Worker Living in WI

| Input | Value |
|-------|-------|
| Tax Type | State Income Tax |
| Work State | IL |
| Resident State | WI |
| Reciprocity Agreement | **Yes** (IL–WI has reciprocity) |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"None"** |
| CF_Tax_Variance | **$0.00** |
| Note | Reciprocity agreement exists; worker is taxed only in WI (resident state) |

---

### Test Case 8: Additional Medicare Threshold

| Input | Value |
|-------|-------|
| Tax Type | Medicare |
| Filing Status | Single |
| YTD Medicare Wages | $198,000.00 |
| Current Period Wages | $8,000.00 |
| Expected Medicare | ($2,000 × 1.45%) + ($6,000 × 2.35%) = $29.00 + $141.00 = $170.00 |
| Actual Medicare | $116.00 ($8,000 × 1.45% — additional Medicare not applied) |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"Under Withholding"** |
| CF_Tax_Variance | **-$54.00** |
| Note | Additional Medicare (0.9%) should apply to wages over $200,000; not withheld |

---

### Test Case 9: Supplemental Pay — Bonus with Flat Rate

| Input | Value |
|-------|-------|
| Tax Type | Federal Income Tax |
| Pay Type | Bonus (Supplemental) |
| Bonus Amount | $10,000.00 |
| Expected Withholding | $2,200.00 (22% flat supplemental rate) |
| Actual Withholding | $2,200.00 |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"None"** |
| CF_Tax_Variance | **$0.00** |
| Note | Supplemental rate correctly applied |

---

### Test Case 10: Pre-Tax Deduction Impact — HSA in California

| Input | Value |
|-------|-------|
| Tax Type | State Income Tax (CA) |
| Gross Pay | $6,000.00 |
| HSA Contribution | $300.00 |
| Federal Taxable Wages | $5,700.00 (HSA reduces federal) |
| CA State Taxable Wages | $6,000.00 (CA does not recognize HSA exclusion) |
| Expected CA Withholding | Based on $6,000 |
| Actual CA Withholding | Based on $5,700 (incorrectly reduced by HSA) |

| Expected Output | Value |
|-----------------|-------|
| CF_Tax_Exception | **"Under Withholding"** |
| CF_Tax_Variance | **-$18.60** |
| Note | California does not allow HSA pre-tax exclusion; taxable wages should be $6,000 |

---

## 9. Integration Test Cases

| # | Scenario | Validation |
|---|----------|-----------|
| IT-01 | Tax exceptions flow to Tax Exception Report | CF value appears correctly in report rows grouped by exception type |
| IT-02 | Tax exceptions feed Dashboard Alert widget | Alert count and variance totals match CF output |
| IT-03 | Multi-state worker with reciprocity | No false positive exception when reciprocity agreement exists |
| IT-04 | Mid-year W-4 change | New withholding applied from effective date forward; no retroactive exception |
| IT-05 | Year-end SS cap processing | Exceptions clear when cap is correctly applied in final pay periods |
| IT-06 | Supplemental pay run | Supplemental tax rates used instead of regular W-4 tables |
| IT-07 | Worker state transfer | Tax elections updated; old state stops, new state starts |

---

## 10. UAT Acceptance Criteria

- [ ] Workers with zero withholding and non-exempt status show "No Withholding" exception
- [ ] Workers with expired or missing W-4/state forms show appropriate exception type
- [ ] Multi-state workers without reciprocity and without allocation show "Multi-State Issue"
- [ ] Multi-state workers WITH reciprocity do NOT generate false exceptions
- [ ] Social Security withholding stops at the annual wage base; excess is flagged
- [ ] Additional Medicare tax applies correctly at $200,000 threshold
- [ ] Supplemental pay uses flat 22% federal rate (not standard W-4 tables)
- [ ] Pre-tax deductions correctly reduce taxable wages per tax type (HSA exception for CA/NJ)
- [ ] Dashboard alert count matches the number of exception records in the Tax Exception Report
- [ ] Threshold configuration changes take effect on next payroll calculation
- [ ] Exempt status auto-expires and generates "Expired Tax Form" after Feb 15

---

## 11. Implementation Notes

### 11.1 Workday Configuration

| Setting | Value |
|---------|-------|
| **Calculated Field Location** | Custom Calculations > Payroll > Tax Validation |
| **Evaluation Trigger** | Post-payroll calculation (after all tax withholdings computed) |
| **Evaluation Scope** | Per-worker, per-tax-authority, per-pay-period |
| **Performance** | Batch processing recommended for pay period close |
| **Caching** | Results cached per completed payroll run |

### 11.2 Threshold Administration

| Setting | Location | Access |
|---------|----------|--------|
| Absolute Threshold ($) | Tenant Configuration > Payroll > Tax Exception Thresholds | Payroll Admin |
| Percentage Threshold (%) | Tenant Configuration > Payroll > Tax Exception Thresholds | Payroll Admin |
| SS Wage Base | Tenant Configuration > Payroll > Tax Authority Settings | System Admin |
| Additional Medicare Threshold | Tenant Configuration > Payroll > Tax Authority Settings | System Admin |
| Reciprocity Table | Tenant Configuration > Payroll > State Tax Rules | Tax Admin |

### 11.3 Integration Points

| System/Process | Integration |
|----------------|-------------|
| Tax Exception Report | Primary data field for report rows; grouped by exception type and tax authority |
| Dashboard Alert Widget | Count of exceptions by type; total variance amount; trend over time |
| Payroll Tax Team Notification | Alert when "Missing Tax Election" or "No Withholding" count exceeds threshold |
| Compliance Audit Trail | Exception records logged for IRS/state audit readiness |
| W-4 Renewal Workflow | Triggers task for workers with expiring exempt status |

---

## 12. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| Tax Election records (W-4 / state) | Data Source | Must have current election data for each worker |
| Payroll Results (tax line items) | Data Source | Tax withholding amounts from completed payroll |
| Federal/State Tax Tables | Configuration | Published IRS and state tax brackets, updated annually |
| Reciprocity Agreement Table | Configuration | Maintained by Tax Admin; updated when agreements change |
| SS Wage Base | Configuration | Updated annually by System Admin per IRS announcement |
| CF_Payroll_Status | Calculated Field | Used to determine if payroll is in a calculable state |
| Worker Profile (locations) | Data Source | Work state and resident state must be current |

---

## 13. Performance Considerations

- **Indexing:** Ensure `Payroll_Result_Tax` is indexed on `Worker_ID` + `Tax_Code` + `Pay_Period`
- **YTD Lookups:** YTD wage aggregations (SS cap, Medicare threshold) should use pre-computed balances, not real-time SUM queries
- **Reciprocity Cache:** Reciprocity table is static within a tax year; cache in memory for batch processing
- **Batch Processing:** For pay period close, run tax exception evaluation in batch for all active workers
- **Expected Volume:** ~10,000 workers × 3 tax types avg × 26 pay periods = ~780,000 evaluations/year
- **Tax Table Updates:** Federal and state tax table changes (typically annual) require reconfiguration and regression testing
