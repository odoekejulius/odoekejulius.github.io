let
    Source = Csv.Document(File.Contents(DataFolder & "concentration_core.csv"), [Delimiter = ",", Columns = 10, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"country", type text},
        {"entries", Int64.Type},
        {"publishers", Int64.Type},
        {"top5_publisher_share", type number},
        {"top10_publisher_share", type number},
        {"publisher_hhi", type number},
        {"authors", Int64.Type},
        {"top5_author_share", type number},
        {"top20_author_share", type number},
        {"author_hhi", type number}
    }, "en-US")
in
    ChangedTypes
