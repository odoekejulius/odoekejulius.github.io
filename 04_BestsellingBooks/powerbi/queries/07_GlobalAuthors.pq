let
    Source = Csv.Document(File.Contents(DataFolder & "global_authors_core.csv"), [Delimiter = ",", Columns = 6, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"first_author", type text},
        {"core_entries", Int64.Type},
        {"core_markets", Int64.Type},
        {"books", Int64.Type},
        {"gender_group", type text},
        {"nationality", type text}
    }, "en-US")
in
    ChangedTypes
