let
    Source = Csv.Document(File.Contents(DataFolder & "data_quality_log.csv"), [Delimiter = ",", Columns = 5, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"check_type", type text},
        {"check", type text},
        {"rows_affected", Int64.Type},
        {"finding", type text},
        {"action", type text}
    }, "en-US")
in
    ChangedTypes
