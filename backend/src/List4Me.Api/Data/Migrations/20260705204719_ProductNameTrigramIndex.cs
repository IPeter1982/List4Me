using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List4Me.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProductNameTrigramIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
            migrationBuilder.Sql(
                "CREATE INDEX IF NOT EXISTS ix_products_name_trgm ON \"Products\" USING GIN (\"Name\" gin_trgm_ops);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_products_name_trgm;");
            // Leave pg_trgm installed — other tables may use it.
        }
    }
}
