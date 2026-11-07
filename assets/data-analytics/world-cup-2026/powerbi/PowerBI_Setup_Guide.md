# FIFA World Cup 2026 - Power BI setup guide

Everything below was generated from the delivered data files, so table names, column names and types match exactly. I could not open Power BI Desktop in my environment, so the scripts were validated statically (every file name, column, type and measure reference was re-parsed against the CSVs) and every measure has an expected value in `Validation_Checks.csv` for you to confirm in about five minutes.

## 1. Load the data (about 5 minutes)

1. Copy the `powerbi_data` folder somewhere permanent (for example `C:\PowerBI_Portfolio\WorldCup2026\powerbi_data\`).
2. Power BI Desktop > Home > Transform data > Manage parameters > New parameter. Name: `DataFolder`, Type: Text, Current value: the folder path **ending with a backslash**. (Or paste `queries\00_DataFolder_parameter.pq` into a Blank Query and edit the path.)
3. For each file in the `queries` folder: Home > New source > Blank query > Advanced editor > replace everything with the file contents > Done. Rename the query to the name in the file name (for example `02_CountrySummary.pq` becomes query `CountrySummary`). Every column is typed with the `en-US` culture, so decimals parse correctly on any regional setting.
4. Close & Apply.

| Query name | CSV file | Rows | Columns |
|---|---|---|---|
| FactTeamMatch | fact_team_match.csv | 184 | 20 |
| DimTeam | dim_team_summary.csv | 48 | 16 |
| Matches | matches_clean.csv | 92 | 16 |
| GroupStandings | group_standings.csv | 48 | 12 |
| ConfederationSummary | confederation_summary.csv | 6 | 13 |
| DataCleaningLog | data_cleaning_log.csv | 3 | 4 |

## 2. Model view: relationships

| From (many) | To (one) | Cardinality | Cross-filter |
|---|---|---|---|
| FactTeamMatch[team] | DimTeam[team] | Many to one | Single |
| FactTeamMatch[match_id] | Matches[match_id] | Many to one | Single |
| GroupStandings[team] | DimTeam[team] | Many to one | Single |
| DimTeam[confederation] | ConfederationSummary[confederation] | Many to one | Single |

Tables without a relationship are deliberately standalone; use them in their own visuals only.

## 3. Sort-by-column (so bands and months sort logically)

Select the column in Data view > Column tools > Sort by column:

- `FactTeamMatch[stage]` sorted by `stage_order`
- `Matches[stage]` sorted by `stage_order`

## 4. Add the measures

Open `Measures_NewMeasure.dax` and add each measure with Modeling > New measure (one at a time), or open DAX query view, paste `Measures_DAXQueryView.dax` and click Update model. Then set the format shown below.

| Measure | Format | Folder | Meaning |
|---|---|---|---|
| Team Matches | 0 | Team form | Rows in the team-match table (two per match) |
| Matches Played | 0 | Team form | Distinct matches in the current filter |
| Wins | 0 | Team form | Wins |
| Draws | 0 | Team form | Draws |
| Losses | 0 | Team form | Losses |
| Win % | 0.0% | Team form | Wins divided by matches |
| Goals For | 0 | Team form | Goals scored |
| Goals Against | 0 | Team form | Goals conceded |
| Goal Difference | +0;-0;0 | Team form | Goals for minus goals against |
| Points | 0 | Team form | 3 for a win, 1 for a draw |
| Clean Sheets | 0 | Team form | Matches without conceding |
| Goals per Team Match | 0.00 | Team form | Average goals scored per match |
| Total Matches | 0 | Tournament | Matches in the Matches table |
| Total Goals | 0 | Tournament | Goals in all matches |
| Avg Goals per Match | 0.00 | Tournament | Average goals per match |
| Draw Matches | 0 | Tournament | Matches that ended level (all in the group stage) |
| Draw % | 0.0% | Tournament | Share of matches drawn |
| Penalty Shootouts | 0 | Tournament | Matches decided on penalties |
| Biggest Win Margin | 0 | Tournament | Largest goal margin |
| Highest Match Total | 0 | Tournament | Most goals in one match |
| Teams Entered | 0 | Teams | Teams in the tournament |
| Teams Still Active | 0 | Teams | Teams not yet eliminated at the data snapshot (July 5, 2026) |
| Reached Round of 16 | 0 | Confederations | Teams that reached the Round of 16 |

## 5. Apply the theme

View > Themes > Browse for themes > pick the `*_theme.json` file in this folder.

## 6. Build the pages

### Page 1: Tournament overview

Scoring and drama across the 92 matches played.

| Visual | Fields / setup |
|---|---|
| Cards (5) | [Total Matches], [Total Goals], [Avg Goals per Match], [Draw %], [Penalty Shootouts] |
| Clustered column | X = Matches[stage] (sorted by stage_order), Y = [Avg Goals per Match]; data labels on |
| Clustered bar | Y = DimTeam[team], X = [Goals For]; Top N 8 by [Goals For] |
| Cards (2) | [Biggest Win Margin], [Highest Match Total] |

### Page 2: Team explorer

One team at a time: record, goals and match log.

| Visual | Fields / setup |
|---|---|
| Slicer | DimTeam[team] (dropdown, single select) |
| Cards (6) | [Points], [Wins], [Draws], [Losses], [Goals For], [Goals Against] |
| Clustered column | X = FactTeamMatch[result], Y = [Team Matches] |
| Table | FactTeamMatch[match_date], [stage], [opponent], [goals_for], [goals_against], [result]; sort by match_date |

### Page 3: Group standings

Twelve group tables with qualifiers highlighted.

| Visual | Fields / setup |
|---|---|
| Slicer | GroupStandings[group] (tile style) |
| Table | GroupStandings[group_rank], [team], [played], [won], [drawn], [lost], [goals_for], [goals_against], [goal_diff], [points]; conditional formatting: background green where group_rank <= 2 |

### Page 4: Confederations

Which confederations are performing and progressing.

| Visual | Fields / setup |
|---|---|
| Clustered column | X = FactTeamMatch[confederation], Y = [Win %] |
| Clustered column | X = FactTeamMatch[confederation], Y = [Goals per Team Match] |
| Clustered column | X = ConfederationSummary[confederation], Y = [teams_entered], [reached_round_of_32], [reached_round_of_16], [still_active] (Sum) |

### Page 5: Storylines and data quality

Penalty shootouts, notes, and the three data corrections.

| Visual | Fields / setup |
|---|---|
| Table | Matches[match_date], [stage], [team_1], [score_1], [score_2], [team_2], [winner], [notes]; visual filter: decided_by_penalties is True or notes is not blank |
| Table | DataCleaningLog[team], [old_eliminated_round], [corrected_eliminated_round], [reason] |

## 7. Check it works (5 minutes)

Create a Table visual, add the measure, apply the filter in the "Filter context" column (use the Filters pane or a slicer) and compare with the expected value. Differences within the tolerance are rounding.

| ID | Measure | Filter context | Expected | Tolerance |
|---|---|---|---|---|
| W01 | Total Matches | No filter | 92.0 | 0.0 |
| W02 | Total Goals | No filter | 269.0 | 0.0 |
| W03 | Avg Goals per Match | No filter | 2.9239 | 0.0001 |
| W04 | Draw % | No filter | 0.2174 | 0.0001 |
| W05 | Penalty Shootouts | No filter | 3.0 | 0.0 |
| W06 | Avg Goals per Match | Matches[stage] = Group Stage | 2.9861 | 0.0001 |
| W07 | Biggest Win Margin | No filter | 6.0 | 0.0 |
| W08 | Highest Match Total | No filter | 8.0 | 0.0 |
| W09 | Wins | DimTeam[team] = France | 5.0 | 0.0 |
| W10 | Points | DimTeam[team] = France | 15.0 | 0.0 |
| W11 | Goals For | DimTeam[team] = France | 14.0 | 0.0 |
| W12 | Goal Difference | DimTeam[team] = France | 12.0 | 0.0 |
| W13 | Clean Sheets | DimTeam[team] = Spain | 4.0 | 0.0 |
| W14 | Matches Played | DimTeam[team] = Argentina | 4.0 | 0.0 |
| W15 | Win % | DimTeam[confederation] = AFC | 0.1034 | 0.0001 |
| W16 | Teams Still Active | No filter | 12.0 | 0.0 |
| W17 | Teams Entered | No filter | 48.0 | 0.0 |
| W18 | Reached Round of 16 | No filter | 16.0 | 0.0 |

## 8. Notes

- Team slicers must use DimTeam[team]. Matches is on the "one" side of the FactTeamMatch relationship, so the Matches-based tournament cards do not respond to a team slicer; use the team measures for team views.
- Fact and Matches use match_date (renamed from date).
- Data snapshot ends July 5, 2026 (92 of 104 matches).
