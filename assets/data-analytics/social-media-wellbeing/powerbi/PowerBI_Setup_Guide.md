# Social Media Use and Student Wellbeing - Power BI setup guide

Everything below was generated from the delivered data files, so table names, column names and types match exactly. I could not open Power BI Desktop in my environment, so the scripts were validated statically (every file name, column, type and measure reference was re-parsed against the CSVs) and every measure has an expected value in `Validation_Checks.csv` for you to confirm in about five minutes.

## 1. Load the data (about 5 minutes)

1. Copy the `powerbi_data` folder somewhere permanent (for example `C:\PowerBI_Portfolio\SocialMedia\powerbi_data\`).
2. Power BI Desktop > Home > Transform data > Manage parameters > New parameter. Name: `DataFolder`, Type: Text, Current value: the folder path **ending with a backslash**. (Or paste `queries\00_DataFolder_parameter.pq` into a Blank Query and edit the path.)
3. For each file in the `queries` folder: Home > New source > Blank query > Advanced editor > replace everything with the file contents > Done. Rename the query to the name in the file name (for example `02_CountrySummary.pq` becomes query `CountrySummary`). Every column is typed with the `en-US` culture, so decimals parse correctly on any regional setting.
4. Close & Apply.

| Query name | CSV file | Rows | Columns |
|---|---|---|---|
| StudentClean | student_clean.csv | 4,500 | 39 |
| UsageTierSummary | usage_tier_summary.csv | 5 | 30 |
| SegmentSummary | segment_summary.csv | 31 | 30 |
| UsageEffects | usage_effects.csv | 5 | 10 |
| GpaDecomposition | gpa_decomposition.csv | 3 | 5 |
| PlatformComparison | platform_comparison.csv | 7 | 10 |
| LateNightByTier | late_night_by_tier.csv | 10 | 5 |
| LateNightAdjusted | late_night_adjusted.csv | 3 | 5 |
| Correlations | correlations.csv | 64 | 3 |
| MinorVsAdultSlopes | minor_vs_adult_slopes.csv | 2 | 4 |
| ImpactLabelCheck | impact_label_check.csv | 4 | 3 |
| ModelComparison | model_comparison.csv | 3 | 2 |
| WhatifUsageReduction | whatif_usage_reduction.csv | 4 | 4 |
| DataQualityLog | data_quality_log.csv | 13 | 5 |

## 2. Model view: relationships

| From (many) | To (one) | Cardinality | Cross-filter |
|---|---|---|---|
| (none - tables are standalone) | | | |

Tables without a relationship are deliberately standalone; use them in their own visuals only.

## 3. Sort-by-column (so bands and months sort logically)

Select the column in Data view > Column tools > Sort by column:

- `StudentClean[Academic_Level]` sorted by `academic_level_order`
- `StudentClean[Social_Comparison_Frequency]` sorted by `comparison_order`
- `StudentClean[stress_band]` sorted by `stress_band_order`
- `StudentClean[wellbeing_band]` sorted by `wellbeing_band_order`
- `StudentClean[gpa_band]` sorted by `gpa_band_order`
- `StudentClean[Overall_Impact]` sorted by `impact_order`

## 4. Add the measures

Open `Measures_NewMeasure.dax` and add each measure with Modeling > New measure (one at a time), or open DAX query view, paste `Measures_DAXQueryView.dax` and click Update model. Then set the format shown below.

| Measure | Format | Folder | Meaning |
|---|---|---|---|
| Students | #,0 | Volume | Students in the current filter |
| Avg Daily Usage Hours | 0.0 | Usage | Average daily social media hours |
| Avg Mental Health Index | 0.0 | Outcomes | Average wellbeing index (higher is better) |
| Avg Stress | 0.0 | Outcomes | Average perceived stress (blanks ignored) |
| Avg GPA | 0.00 | Outcomes | Average GPA (blanks ignored) |
| Avg Sleep Hours | 0.0 | Outcomes | Average nightly sleep |
| Avg Sleep Quality | 0.0 | Outcomes | Average sleep quality (1-5) |
| Low Wellbeing Students | #,0 | Wellbeing | Students with wellbeing index below 60 |
| Low Wellbeing % | 0.0% | Wellbeing | Share with wellbeing index below 60 |
| Short Sleep % | 0.0% | Wellbeing | Share sleeping less than guidance for their age (minors under 8h, adults under 7h) |
| High Stress % | 0.0% | Wellbeing | Share with stress 27+ among students with a stress score |
| Low GPA % | 0.0% | Wellbeing | Share with GPA below 3.0 among students with a GPA |
| Negative Impact % | 0.0% | Impact label | Share rated Negative |
| Beneficial % | 0.0% | Impact label | Share rated Beneficial |
| Neutral % | 0.0% | Impact label | Share rated Neutral |
| Late Night % | 0.0% | Usage | Share who use social media late at night |
| Minors % | 0.0% | Usage | Share aged under 18 |
| Heavy Users 7h+ | #,0 | Focus group | Students using 7 or more hours a day |
| Heavy Users 7h+ % | 0.0% | Focus group | Share of all students using 7+ hours |
| Low Wellbeing % Among 7h+ | 0.0% | Focus group | Low-wellbeing rate among 7h+ users |
| Share of Low Wellbeing in 7h+ | 0.0% | Focus group | Share of all low-wellbeing students who use 7+ hours |
| Wellbeing Points per Extra Hour | 0.00 | Effects | Regression slope from the UsageEffects table |
| R-squared Usage to Wellbeing | 0.00 | Effects | Share of wellbeing variation explained by daily hours |

## 5. Apply the theme

View > Themes > Browse for themes > pick the `*_theme.json` file in this folder.

## 6. Build the pages

### Page 1: Overview

Headline numbers and the label distribution by usage tier.

| Visual | Fields / setup |
|---|---|
| Cards (5) | [Students], [Avg Daily Usage Hours], [Heavy Users 7h+ %], [Wellbeing Points per Extra Hour], [R-squared Usage to Wellbeing] |
| 100% stacked column | X = StudentClean[usage_tier], Values = [Beneficial %], [Neutral %], [Negative %] on a 100% stacked column chart |
| Slicers | StudentClean[age_group], StudentClean[Academic_Level] |

### Page 2: Dose-response

How wellbeing, stress, grades and sleep change as usage rises.

| Visual | Fields / setup |
|---|---|
| Clustered column | X = StudentClean[usage_tier], Y = one of [Avg Mental Health Index], [Avg Stress], [Avg GPA], [Avg Sleep Hours], [Low Wellbeing %], [Short Sleep %]; use a Field parameter (Modeling > New parameter > Fields) to switch measures |
| Scatter | X = StudentClean[Daily_Usage_Hours], Y = StudentClean[Mental_Health_Index], Legend = StudentClean[Overall_Impact]; turn on Analytics > Trend line |
| Table | UsageEffects[outcome], [slope_per_extra_hour], [ci_low], [ci_high], [adjusted_slope], [r_squared] |

### Page 3: What matters

Everything except hours barely moves wellbeing.

| Visual | Fields / setup |
|---|---|
| Clustered bar (small multiples) | Axis = StudentClean[Primary_Platform] (then Gender, Device_Type, Social_Comparison_Frequency in separate visuals), Value = [Avg Mental Health Index]; set axis minimum to 0 to show how small the gaps are |
| Table | PlatformComparison[platform], [students], [mean_usage], [mean_mh], [adj_mh_diff_vs_instagram], [adj_ci_low], [adj_ci_high], [adj_p_value] |
| Clustered column | X = LateNightByTier[usage_tier], Y = LateNightByTier[mean_mh], Legend = LateNightByTier[late_night] |
| Table | LateNightAdjusted[outcome], [late_night_coefficient_controlling_usage], [ci_low], [ci_high], [p_value] |

### Page 4: Sleep and grades

The sleep and stress route from hours to GPA.

| Visual | Fields / setup |
|---|---|
| Line and clustered column | X = StudentClean[usage_tier], Column = [Late Night %], Line = [Avg Sleep Hours] (secondary axis) |
| Table / bar | GpaDecomposition[model], [usage_coefficient], [share_of_usage_effect_remaining] |

### Page 5: Action plan

Where to focus and what a reduction could be associated with.

| Visual | Fields / setup |
|---|---|
| Cards (3) | [Heavy Users 7h+], [Low Wellbeing % Among 7h+], [Share of Low Wellbeing in 7h+] |
| Table | WhatifUsageReduction[hours_reduced_per_day], [mental_health_points_gained], [gpa_points_gained], [sleep_hours_gained] |
| Text box | Scenario, not a forecast: observational data cannot prove that cutting hours causes these gains. |

### Page 6: Data quality

Every cleaning decision and caveat.

| Visual | Fields / setup |
|---|---|
| Table | DataQualityLog[check_type], [check], [rows_affected], [finding], [action] |

## 7. Check it works (5 minutes)

Create a Table visual, add the measure, apply the filter in the "Filter context" column (use the Filters pane or a slicer) and compare with the expected value. Differences within the tolerance are rounding.

| ID | Measure | Filter context | Expected | Tolerance |
|---|---|---|---|---|
| S01 | Students | No filter | 4500.0 | 0.0 |
| S02 | Avg Daily Usage Hours | No filter | 5.2959 | 0.001 |
| S03 | Avg Mental Health Index | No filter | 79.8731 | 0.001 |
| S04 | Avg Stress | No filter | 13.5121 | 0.001 |
| S05 | Avg GPA | No filter | 3.4293 | 0.001 |
| S06 | Low Wellbeing % | No filter | 0.0769 | 0.0001 |
| S07 | Low Wellbeing % | usage_tier = 5 Very high (10h+) | 0.8 | 0.0001 |
| S08 | Low Wellbeing % | usage_tier = 4 High (7-<10h) | 0.1377 | 0.0001 |
| S09 | Short Sleep % | No filter | 0.6382 | 0.0001 |
| S10 | High Stress % | No filter | 0.0512 | 0.0001 |
| S11 | Negative Impact % | No filter | 0.0367 | 0.0001 |
| S12 | Beneficial % | usage_tier = 1 Light (<3h) | 1.0 | 0.0001 |
| S13 | Avg Mental Health Index | Primary platform = TikTok | 79.8532 | 0.001 |
| S14 | Avg Sleep Hours | Late_Night_Usage = True | 6.4314 | 0.001 |
| S15 | Heavy Users 7h+ | No filter | 961.0 | 0.0 |
| S16 | Heavy Users 7h+ % | No filter | 0.2136 | 0.0001 |
| S17 | Low Wellbeing % Among 7h+ | No filter | 0.3444 | 0.0001 |
| S18 | Share of Low Wellbeing in 7h+ | No filter | 0.9566 | 0.0001 |
| S19 | Minors % | No filter | 0.2711 | 0.0001 |
| S20 | Wellbeing Points per Extra Hour | No filter | -4.2018 | 0.0001 |
| S21 | Low GPA % | No filter | 0.1395 | 0.0001 |

## 8. Notes

- Stress and GPA are blank for 46 and 85 students: AVERAGE and COUNT ignore blanks, which is what the measures rely on.
- All tables are standalone, so no relationships are needed; the aggregate tables are model outputs from the analysis.
