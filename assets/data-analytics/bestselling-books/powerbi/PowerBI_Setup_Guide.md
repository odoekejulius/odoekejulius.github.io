# International Bestselling Books - Power BI setup guide

Everything below was generated from the delivered data files, so table names, column names and types match exactly. I could not open Power BI Desktop in my environment, so the scripts were validated statically (every file name, column, type and measure reference was re-parsed against the CSVs) and every measure has an expected value in `Validation_Checks.csv` for you to confirm in about five minutes.

## 1. Load the data (about 5 minutes)

1. Copy the `powerbi_data` folder somewhere permanent (for example `C:\PowerBI_Portfolio\Books\powerbi_data\`).
2. Power BI Desktop > Home > Transform data > Manage parameters > New parameter. Name: `DataFolder`, Type: Text, Current value: the folder path **ending with a backslash**. (Or paste `queries\00_DataFolder_parameter.pq` into a Blank Query and edit the path.)
3. For each file in the `queries` folder: Home > New source > Blank query > Advanced editor > replace everything with the file contents > Done. Rename the query to the name in the file name (for example `02_CountrySummary.pq` becomes query `CountrySummary`). Every column is typed with the `en-US` culture, so decimals parse correctly on any regional setting.
4. Close & Apply.

| Query name | CSV file | Rows | Columns |
|---|---|---|---|
| Books | books_clean.csv | 7,909 | 40 |
| CountrySummary | country_summary.csv | 45 | 18 |
| BookRuns | book_runs.csv | 4,826 | 13 |
| TopPublishers | top_publishers_core.csv | 75 | 5 |
| ConcentrationCore | concentration_core.csv | 5 | 10 |
| AuthorLeaderboard | author_leaderboard_top200.csv | 200 | 10 |
| GlobalAuthors | global_authors_core.csv | 135 | 6 |
| AuthorFlows | author_nationality_flows.csv | 539 | 4 |
| StatisticalTests | statistical_tests.csv | 16 | 7 |
| DataQualityLog | data_quality_log.csv | 15 | 5 |

## 2. Model view: relationships

| From (many) | To (one) | Cardinality | Cross-filter |
|---|---|---|---|
| Books[country] | CountrySummary[country] | Many to one | Single |
| BookRuns[country] | CountrySummary[country] | Many to one | Single |
| TopPublishers[country] | CountrySummary[country] | Many to one | Single |
| ConcentrationCore[country] | CountrySummary[country] | Many to one | Single |
| AuthorFlows[country] | CountrySummary[country] | Many to one | Single |

Tables without a relationship are deliberately standalone; use them in their own visuals only.

## 3. Sort-by-column (so bands and months sort logically)

Select the column in Data view > Column tools > Sort by column:

- `Books[month_name]` sorted by `month_number`
- `Books[author_gender_group]` sorted by `author_gender_group_order`

## 4. Add the measures

Open `Measures_NewMeasure.dax` and add each measure with Modeling > New measure (one at a time), or open DAX query view, paste `Measures_DAXQueryView.dax` and click Update model. Then set the format shown below.

| Measure | Format | Folder | Meaning |
|---|---|---|---|
| Entries | 0 | Volume | Chart placements (one row = one title on one monthly list) |
| Core Entries | 0 | Volume | Entries in the five countries with a full monthly series |
| Unique Books | 0 | Volume | Distinct title + first author |
| Unique Authors | 0 | Volume | Distinct first authors |
| Months Covered | 0 | Volume | Distinct list months in the current filter |
| Female Entries | 0 | Gender | Entries whose authors are all women |
| Male Entries | 0 | Gender | Entries whose authors are all men |
| Female Share | 0.0% | Gender | Female share of single-gender author entries (all rows) |
| Female Share (Comparable) | 0.0% | Gender | Same, excluding Italy before 2018 (different list definition) - use this one for trends |
| Female Share at Number One (Comparable) | 0.0% | Gender | Female share at rank 1 |
| Female Share Ranks 2-10 (Comparable) | 0.0% | Gender | Female share at ranks 2-10 |
| Origin Known Entries | 0 | Origin | Entries with known author nationality and comparable list definition |
| Domestic Author Entries | 0 | Origin | Entries by an author from the list country |
| Domestic Author Share | 0.0% | Origin | Share of entries by authors from the list country |
| Foreign Author Share | 0.0% | Origin | Share of entries by authors from elsewhere |
| Domestic Publisher Share | 0.0% | Origin | Share published in the list country |
| New Entry Share | 0.0% | Churn | Share of entries that are a title's first month on that country list |
| Distinct Number One Books | 0 | Churn | Different books that reached #1 |
| Anthology Share | 0.0% | Volume | Share of entries with author "[Various]" |
| Median Months on List | 0.0 | Staying power | Median months a book stays on a core list (fully observed runs) |
| Avg Months on List | 0.00 | Staying power | Average months on a core list (fully observed runs) |
| Share One-Month Runs | 0.0% | Staying power | Share of books that appear for just one month |
| Top 5 Publisher Share | 0.0% | Concentration | Share of entries from the five biggest publishers (one value per core country) |
| Publisher HHI | 0 | Concentration | Herfindahl index of publishers (0-10,000) |
| Authors in 3+ Core Markets | 0 | Reach | Authors who charted in 3 or more core countries |

## 5. Apply the theme

View > Themes > Browse for themes > pick the `*_theme.json` file in this folder.

## 6. Build the pages

### Page 1: Overview

Scope of the data and the coverage warning: only five countries have a full monthly series.

| Visual | Fields / setup |
|---|---|
| Cards (4) | [Entries], [Unique Books], [Unique Authors], [Months Covered] |
| Clustered bar | Y = Books[country], X = [Entries], Legend = Books[coverage_group]; sort by [Entries] descending; show top 15 |
| Slicers | CountrySummary[coverage_group] (single select), Books[list_year] |
| Text box | "Only Germany, Italy, United States, Spain and France have a continuous monthly series. Other countries are snapshots of 1-10 months." |

### Page 2: Who tops the lists: gender

Is the share of women authors rising, and do they reach #1?

| Visual | Fields / setup |
|---|---|
| Line chart | X = Books[list_year], Y = [Female Share (Comparable)], Legend = Books[country]; page filter CountrySummary[coverage_group] = Core (monthly series) |
| Clustered column | X = Books[list_rank], Y = [Female Share (Comparable)]; filter CountrySummary[coverage_group] = Core; add a constant line at 50% |
| Cards (2) | [Female Share at Number One (Comparable)], [Female Share Ranks 2-10 (Comparable)] |
| Table | StatisticalTests[test], [group], [estimate], [ci_low], [ci_high], [p_value]; filter test contains "Female" |
| Text box | Italy before 2018 is a different list definition (97% Italian authors) and is excluded from "Comparable" measures. |

### Page 3: Home vs imported

How much of each list is by domestic authors and publishers, and who exports to the core markets.

| Visual | Fields / setup |
|---|---|
| Line chart | X = Books[list_year], Y = [Domestic Author Share], Legend = Books[country]; filter CountrySummary[coverage_group] = Core |
| Clustered bar | Y = Books[country], X = [Domestic Author Share] and [Domestic Publisher Share]; filter CountrySummary[coverage_group] = Core |
| Matrix | Rows = AuthorFlows[first_author_nationality] (Top N 10 by Sum of entries), Columns = AuthorFlows[country], Values = Sum of AuthorFlows[entries]; filter AuthorFlows[coverage_group] = Core; conditional-format background by value |
| Slicer | CountrySummary[country] |

### Page 4: Staying power and concentration

How long books last, how concentrated publishing and authorship are, and which authors travel.

| Visual | Fields / setup |
|---|---|
| Cards (3) | [Median Months on List], [Avg Months on List], [Share One-Month Runs] |
| Column chart | X = BookRuns[months_on_list], Y = Count of BookRuns[book_key]; filter BookRuns[run_fully_observed] = 1 |
| Clustered bar | Y = ConcentrationCore[country], X = [Top 5 Publisher Share]; second bar: ConcentrationCore[top5_author_share] |
| Table | TopPublishers[country], [publisher_rank], [publisher], [entries], [share]; slicer on CountrySummary[country]; Top N 10 |
| Table | GlobalAuthors[first_author], [core_markets], [core_entries], [gender_group], [nationality]; sort by core_markets then core_entries descending |

### Page 5: Data quality

Every cleaning decision and caveat.

| Visual | Fields / setup |
|---|---|
| Table | DataQualityLog[check_type], [check], [rows_affected], [finding], [action] |

## 7. Check it works (5 minutes)

Create a Table visual, add the measure, apply the filter in the "Filter context" column (use the Filters pane or a slicer) and compare with the expected value. Differences within the tolerance are rounding.

| ID | Measure | Filter context | Expected | Tolerance |
|---|---|---|---|---|
| B01 | Entries | No filter | 7909.0 | 0.0 |
| B02 | Months Covered | No filter | 114.0 | 0.0 |
| B03 | Unique Authors | No filter | 1784.0 | 0.0 |
| B04 | Core Entries | No filter | 5689.0 | 0.0 |
| B05 | Female Share (Comparable) | CountrySummary[coverage_group] = Core (monthly series) | 0.4363 | 0.0001 |
| B06 | Female Share | CountrySummary[coverage_group] = Core (monthly series) | 0.4158 | 0.0001 |
| B07 | Female Share at Number One (Comparable) | CountrySummary[coverage_group] = Core (monthly series) | 0.3718 | 0.0001 |
| B08 | Female Share Ranks 2-10 (Comparable) | CountrySummary[coverage_group] = Core (monthly series) | 0.4435 | 0.0001 |
| B09 | Domestic Author Share | CountrySummary[coverage_group] = Core (monthly series) | 0.6464 | 0.0001 |
| B10 | Domestic Publisher Share | CountrySummary[coverage_group] = Core (monthly series) | 0.7119 | 0.0001 |
| B11 | New Entry Share | CountrySummary[coverage_group] = Core (monthly series) | 0.496 | 0.0001 |
| B12 | Entries | CountrySummary[country] = Germany | 1140.0 | 0.0 |
| B13 | Unique Books | CountrySummary[country] = Germany | 500.0 | 0.0 |
| B14 | Domestic Author Share | CountrySummary[country] = Italy | 0.5559 | 0.0001 |
| B15 | Female Share (Comparable) | CountrySummary[country] = Italy | 0.4367 | 0.0001 |
| B16 | Distinct Number One Books | CountrySummary[country] = United States | 95.0 | 0.0 |
| B17 | Entries | CountrySummary[country] = France and Books[list_year] = 2022 | 110.0 | 0.0 |
| B18 | Median Months on List | No filter | 1.0 | 0.01 |
| B19 | Share One-Month Runs | No filter | 0.5899 | 0.0001 |
| B20 | Avg Months on List | No filter | 2.01 | 0.01 |
| B21 | Top 5 Publisher Share | CountrySummary[country] = Italy | 0.4895 | 0.0005 |
| B22 | Authors in 3+ Core Markets | No filter | 49.0 | 0.0 |
| B23 | Anthology Share | No filter | 0.0044 | 0.0001 |

## 8. Notes

- ALWAYS use CountrySummary[country] and CountrySummary[coverage_group] for country slicers and filters: the filter then reaches Books, BookRuns, TopPublishers, ConcentrationCore and AuthorFlows through the relationships. Filtering Books[country] only filters Books.
- Books[list_rank] replaces the original column `rank`, and Books[list_month] replaces `date` (renamed to avoid clashes with DAX function names).
- "Core" = Germany, Italy, United States, Spain, France.
