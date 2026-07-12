using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace List4Me.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ListFromTemplateFkSetNull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Lists_FromTemplateId",
                table: "Lists",
                column: "FromTemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lists_ListTemplates_FromTemplateId",
                table: "Lists",
                column: "FromTemplateId",
                principalTable: "ListTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lists_ListTemplates_FromTemplateId",
                table: "Lists");

            migrationBuilder.DropIndex(
                name: "IX_Lists_FromTemplateId",
                table: "Lists");
        }
    }
}
