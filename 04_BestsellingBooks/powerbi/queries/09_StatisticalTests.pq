let
    Source = Csv.Document(File.Contents(DataFolder & "statistical_tests.csv"), [Delimiter = ",", Columns = 7, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"test", type text},
        {"group", type text},
        {"n", Int64.Type},
        {"estimate", type number},
        {"ci_low", type number},
        {"ci_high", type number},
        {"p_value", type number}
    }, "en-US")
in
    ChangedTypes
