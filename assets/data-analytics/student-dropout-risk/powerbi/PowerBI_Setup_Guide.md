# Student Dropout Risk 2026 - Power BI setup guide

Everything below was generated from the delivered data files, so table names, column names and types match exactly. I could not open Power BI Desktop in my environment, so the scripts were validated statically (every file name, column, type and measure reference was re-parsed against the CSVs) and every measure has an expected value in `Validation_Checks.csv` for you to confirm in about five minutes.

## 1. Load the data (about 5 minutes)

1. Copy the `powerbi_data` folder somewhere permanent (for example `C:\PowerBI_Portfolio\StudentDropout\powerbi_data\`).
2. Power BI Desktop > Home > Transform data > Manage parameters > New parameter. Name: `DataFolder`, Type: Text, Current value: the folder path **ending with a backslash**. (Or paste `queries\00_DataFolder_parameter.pq` into a Blank Query and edit the path.)
3. For each file in the `queries` folder: Home > New source > Blank query > Advanced editor > replace everything with the file contents > Done. Rename the query to the name in the file name (for example `02_CountrySummary.pq` becomes query `CountrySummary`). Every column is typed with the `en-US` culture, so decimals parse correctly on any regional setting.
4. Close & Apply.

| Query name | CSV file | Rows | Columns |
|---|---|---|---|
| StudentClean | student_clean.csv | 100,000 | 69 |
| SegmentRates | segment_dropout_rates.csv | 137 | 10 |
| DriverRanking | driver_ranking.csv | 29 | 4 |
| RiskTierSummary | risk_tier_summary.csv | 4 | 7 |
| RiskDecileLift | risk_decile_lift.csv | 10 | 7 |
| RiskFlagLadder | risk_flag_ladder.csv | 11 | 4 |
| RiskFlagDefinitions | risk_flag_definitions.csv | 10 | 6 |
| IncomeTuitionJob | income_tuition_job_matrix.csv | 12 | 6 |
| FairnessAudit | fairness_audit.csv | 25 | 9 |
| AdjustedOdds | adjusted_odds_ratios.csv | 34 | 5 |
| LmsByStudyMode | lms_by_study_mode.csv | 18 | 4 |
| ModelComparison | model_comparison.csv | 5 | 3 |
| ImpactScenarios | impact_scenarios.csv | 3 | 4 |
| DataQualityLog | data_quality_log.csv | 13 | 5 |

## 2. Model view: relationships

| From (many) | To (one) | Cardinality | Cross-filter |
|---|---|---|---|
| (none - tables are standalone) | | | |

Tables without a relationship are deliberately standalone; use them in their own visuals only.

## 3. Sort-by-column (so bands and months sort logically)

Select the column in Data view > Column tools > Sort by column:

- `StudentClean[risk_tier]` sorted by `risk_tier_order`
- `StudentClean[family_income_level]` sorted by `family_income_order`
- `StudentClean[admission_band]` sorted by `admission_band_order`

## 4. Add the measures

Open `Measures_NewMeasure.dax` and add each measure with Modeling > New measure (one at a time), or open DAX query view, paste `Measures_DAXQueryView.dax` and click Update model. Then set the format shown below.

| Measure | Format | Folder | Meaning |
|---|---|---|---|
| Students | #,0 | Volume | Students in the current filter |
| Dropouts | #,0 | Volume | Students who dropped out |
| Retained | #,0 | Volume | Students retained |
| Dropout Rate | 0.0% | Rate | Dropouts divided by students |
| Overall Dropout Rate | 0.0% | Rate | Dropout rate ignoring all filters (reference line) |
| Lift vs Overall | 0.00 | Rate | Dropout rate relative to the overall rate |
| Avg Risk Score | 0.0% | Risk model | Average predicted dropout probability (out-of-fold) |
| High and Critical Students | #,0 | Risk model | Students whose risk score is above 50% |
| High and Critical Share of Students | 0.0% | Risk model | Share of students in the High and Critical tiers |
| High and Critical Share of Dropouts | 0.0% | Risk model | Share of dropouts that sit in the High and Critical tiers |
| Flagged Students (50% threshold) | #,0 | Fairness | Students flagged at a 50% threshold |
| Flagged Rate | 0.0% | Fairness | Share flagged |
| True Positive Rate | 0.0% | Fairness | Share of actual dropouts that were flagged |
| False Positive Rate | 0.0% | Fairness | Share of retained students that were flagged |
| Avg Risk Flags | 0.00 | Early warning | Average number of the ten transparent risk flags |
| Students with 3+ Flags | #,0 | Early warning | Recommended referral threshold |
| Low Income Unpaid Students | #,0 | Focus groups | Low income and tuition not up to date |
| Low Income Unpaid Dropout Rate | 0.0% | Focus groups | Dropout rate for that group |
| Heavy Work Students (20h+) | #,0 | Focus groups | Students working 20+ hours a week |
| Heavy Work Dropout Rate | 0.0% | Focus groups | Dropout rate for that group |
| Tuition Unpaid Dropout Rate | 0.0% | Focus groups | Dropout rate when tuition is not up to date |
| One Failed Unit Students | #,0 | Focus groups | Exactly one failed unit |
| Scenario: Retained at 10% Uplift | #,0 | Scenario | Illustrative: 10% of expected High+Critical dropouts retained (assumption, not a forecast) |

## 5. Apply the theme

View > Themes > Browse for themes > pick the `*_theme.json` file in this folder.

## 6. Build the pages

### Page 1: Overview

Headline dropout numbers and the ranking of drivers.

| Visual | Fields / setup |
|---|---|
| Cards (5) | [Students], [Dropouts], [Dropout Rate], [High and Critical Share of Students], [High and Critical Share of Dropouts] |
| Clustered bar | Y = DriverRanking[dimension], X = DriverRanking[spread_pp]; sort descending; show top 14; colour by category using conditional formatting on dimension (academic, engagement, financial) |
| Text box | "Gender, nationality, course, international status, age and commute show gaps of about 3 points or less." |

### Page 2: Driver explorer

Dropout rate for any driver, with confidence intervals.

| Visual | Fields / setup |
|---|---|
| Slicer | SegmentRates[dimension] (single select, dropdown) |
| Clustered column | X = SegmentRates[value_key], Y = SegmentRates[dropout_rate] (Average); error bars: Upper = SegmentRates[ci_high], Lower = SegmentRates[ci_low]; constant line at the overall rate (32.0%) |
| Table | SegmentRates[value], [students], [dropouts], [dropout_rate], [lift_vs_overall] |
| Note | For any rate in a new visual built on StudentClean use [Dropout Rate]; for SegmentRates use SUM(dropouts)/SUM(students) via the [dropouts] and [students] columns |

### Page 3: Risk triage

Who to contact first.

| Visual | Fields / setup |
|---|---|
| Clustered column | X = StudentClean[risk_tier] (sorted by risk_tier_order), Y = [Students] and [Dropout Rate] |
| Clustered column | X = StudentClean[risk_tier], Y = [Avg Risk Score] and [Dropout Rate] (calibration check) |
| Line chart | X = RiskDecileLift[cum_students], Y = RiskDecileLift[cum_dropouts_captured] |
| Column chart | X = RiskFlagLadder[risk_flag_count], Y = RiskFlagLadder[dropout_rate]; constant line at 32.0% |
| Table | RiskFlagDefinitions[flag], [students_flagged], [dropout_rate_flagged], [dropout_rate_not_flagged] |

### Page 4: Equity audit

Check the risk model does not treat groups unequally.

| Visual | Fields / setup |
|---|---|
| Slicer | FairnessAudit[attribute] |
| Clustered column | X = FairnessAudit[group], Y = FairnessAudit[actual_dropout_rate], FairnessAudit[flagged_rate] |
| Table | FairnessAudit[group], [students], [true_positive_rate], [false_positive_rate], [auc] |
| Cards | [True Positive Rate], [False Positive Rate] with a slicer on StudentClean[gender] to reproduce any row |

### Page 5: Action plan

Focus groups and the illustrative impact.

| Visual | Fields / setup |
|---|---|
| Cards (6) | [Low Income Unpaid Students], [Low Income Unpaid Dropout Rate], [Heavy Work Students (20h+)], [Heavy Work Dropout Rate], [One Failed Unit Students], [Students with 3+ Flags] |
| Matrix | Rows = IncomeTuitionJob[family_income_level], Columns = IncomeTuitionJob[tuition_up_to_date], Values = IncomeTuitionJob[dropout_rate] (Average); conditional formatting on background |
| Table | ImpactScenarios[retention_uplift_among_expected_dropouts], [students_retained]; plus card [Scenario: Retained at 10% Uplift] |
| Table | AdjustedOdds[term], [OR], [lo], [hi], [p]; filter to the terms discussed in the report |

### Page 6: Data quality

Every cleaning decision and caveat.

| Visual | Fields / setup |
|---|---|
| Table | DataQualityLog[check_type], [check], [rows_affected], [finding], [action] |

## 7. Check it works (5 minutes)

Create a Table visual, add the measure, apply the filter in the "Filter context" column (use the Filters pane or a slicer) and compare with the expected value. Differences within the tolerance are rounding.

| ID | Measure | Filter context | Expected | Tolerance |
|---|---|---|---|---|
| D01 | Students | No filter | 100000.0 | 0.0 |
| D02 | Dropouts | No filter | 32004.0 | 0.0 |
| D03 | Dropout Rate | No filter | 0.32 | 0.0001 |
| D04 | Dropout Rate | family_income_level = Low | 0.4292 | 0.0001 |
| D05 | Dropout Rate | tuition_up_to_date = 0 | 0.4422 | 0.0001 |
| D06 | Dropout Rate | units_failed_band = 7+ | 0.8 | 0.0001 |
| D07 | Dropout Rate | attendance_band = 0-50 | 0.5917 | 0.0001 |
| D08 | Lift vs Overall | family_income_level = Low | 1.3411 | 0.0005 |
| D09 | High and Critical Students | No filter | 28569.0 | 0.0 |
| D10 | High and Critical Share of Dropouts | No filter | 0.6972 | 0.0001 |
| D11 | High and Critical Share of Students | No filter | 0.2857 | 0.0001 |
| D12 | Dropout Rate | risk_tier = Critical (80%+) | 0.9155 | 0.0001 |
| D13 | Avg Risk Score | No filter | 0.32 | 0.0001 |
| D14 | Students with 3+ Flags | No filter | 48145.0 | 0.0 |
| D15 | Dropout Rate | risk_flag_count = 5 | 0.7247 | 0.0001 |
| D16 | Low Income Unpaid Students | No filter | 10110.0 | 0.0 |
| D17 | Low Income Unpaid Dropout Rate | No filter | 0.5305 | 0.0001 |
| D18 | Heavy Work Students (20h+) | No filter | 20174.0 | 0.0 |
| D19 | Heavy Work Dropout Rate | No filter | 0.4532 | 0.0001 |
| D20 | True Positive Rate | gender = Female | 0.6939 | 0.0002 |
| D21 | False Positive Rate | family_income_level = Low | 0.1454 | 0.0002 |
| D22 | Flagged Rate | disability_status = 1 | 0.3272 | 0.0002 |
| D23 | One Failed Unit Students | No filter | 16601.0 | 0.0 |
| D24 | Scenario: Retained at 10% Uplift | No filter | 2231.0 | 0.0 |

## 8. Notes

- StudentClean is 100,000 rows by about 70 columns; Import mode handles it comfortably.
- risk_score is an out-of-fold probability, so it is safe to use for evaluation. Tier boundaries: Low up to 20%, Moderate above 20% to 50%, High above 50% to 80%, Critical above 80%.
- The Tier column risk_tier_order is 1 to 4; tiers 3 and 4 are High and Critical.
