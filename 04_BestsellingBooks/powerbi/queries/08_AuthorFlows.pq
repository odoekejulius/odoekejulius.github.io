let
    Source = Csv.Document(File.Contents(DataFolder & "author_nationality_flows.csv"), [Delimiter = ",", Columns = 4, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"country", type text},
        {"first_author_nationality", type text},
        {"entries", Int64.Type},
        {"coverage_group", type text}
    }, "en-US")
in
    ChangedTypes
