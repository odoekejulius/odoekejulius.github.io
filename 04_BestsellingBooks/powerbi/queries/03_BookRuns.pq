let
    Source = Csv.Document(File.Contents(DataFolder & "book_runs.csv"), [Delimiter = ",", Columns = 13, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"country", type text},
        {"book_key", type text},
        {"title", type text},
        {"first_author", type text},
        {"author_gender_group", type text},
        {"months_on_list", Int64.Type},
        {"entries", Int64.Type},
        {"first_month", type date},
        {"last_month", type date},
        {"best_rank", Int64.Type},
        {"mean_rank", type number},
        {"run_fully_observed", Int64.Type},
        {"coverage_group", type text}
    }, "en-US")
in
    ChangedTypes
