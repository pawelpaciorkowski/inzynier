using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginHistoryDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Browser",
                table: "LoginHistories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DeviceType",
                table: "LoginHistories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "LoginHistories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "IsSuccessful",
                table: "LoginHistories",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "LoginHistories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "OperatingSystem",
                table: "LoginHistories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "LoginHistories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_LoginHistories_UserId",
                table: "LoginHistories",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoginHistories_users_UserId",
                table: "LoginHistories",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoginHistories_users_UserId",
                table: "LoginHistories");

            migrationBuilder.DropIndex(
                name: "IX_LoginHistories_UserId",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "Browser",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "DeviceType",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "IsSuccessful",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "OperatingSystem",
                table: "LoginHistories");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "LoginHistories");
        }
    }
}
