using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDetailsAndUserIdToSystemLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Exception",
                table: "SystemLogs");

            migrationBuilder.RenameColumn(
                name: "Properties",
                table: "SystemLogs",
                newName: "Details");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "SystemLogs",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SystemLogs");

            migrationBuilder.RenameColumn(
                name: "Details",
                table: "SystemLogs",
                newName: "Properties");

            migrationBuilder.AddColumn<string>(
                name: "Exception",
                table: "SystemLogs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
