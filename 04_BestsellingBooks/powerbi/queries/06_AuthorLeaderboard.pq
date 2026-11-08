let
    Source = Csv.Document(File.Contents(DataFolder & "author_leaderboard_top200.csv"), [Delimiter = ",", Columns = 10, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"first_author", type text},
        {"entries", Int64.Type},
        {"core_entries", Int64.Type},
        {"countries", Int64.Type},
        {"core_markets", Int64.Type},
        {"books", Int64.Type},
        {"months", Int64.Type},
        {"best_rank", Int64.Type},
        {"gender_group", type text},
        {"nationality", type text}
    }, "en-US")
in
    ChangedTypes
