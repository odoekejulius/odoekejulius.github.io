let
    Source = Csv.Document(File.Contents(DataFolder & "country_summary.csv"), [Delimiter = ",", Columns = 18, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    ChangedTypes = Table.TransformColumnTypes(PromotedHeaders, {
        {"country", type text},
        {"coverage_group", type text},
        {"months_covered", Int64.Type},
        {"entries", Int64.Type},
        {"first_month", type date},
        {"last_month", type date},
        {"unique_books", Int64.Type},
        {"unique_authors", Int64.Type},
        {"female_entries", Int64.Type},
        {"male_entries", Int64.Type},
        {"female_share", type number},
        {"origin_known_entries", Int64.Type},
        {"domestic_author_entries", Int64.Type},
        {"domestic_author_share", type number},
        {"domestic_publisher_entries", Int64.Type},
        {"domestic_publisher_share", type number},
        {"new_entry_share", type number},
        {"sample_size_flag", type text}
    }, "en-US")
in
    ChangedTypes
