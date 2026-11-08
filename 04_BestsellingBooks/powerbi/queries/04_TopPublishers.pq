let
    Source = Csv.Document(File.Contents(DataFolder & "top_publishers_core.csv"), [Delimiter = ",", Columns = 5, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"country", type text},
        {"publisher_rank", Int64.Type},
        {"publisher", type text},
        {"entries", Int64.Type},
        {"share", type number}
    }, "en-US")
in
    ChangedTypes
