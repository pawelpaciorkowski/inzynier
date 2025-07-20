using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupsAndTagsRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedGroupId",
                table: "Tasks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Tags",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tags",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "AssignedGroupId",
                table: "Meetings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Meetings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedGroupId",
                table: "Invoices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Invoices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedGroupId",
                table: "Customers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedUserId",
                table: "Customers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Contracts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ResponsibleGroupId",
                table: "Contracts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContractTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ContractId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContractTags_Contracts_ContractId",
                        column: x => x.ContractId,
                        principalTable: "Contracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContractTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "InvoiceTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceTags_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MeetingTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MeetingId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeetingTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MeetingTags_Meetings_MeetingId",
                        column: x => x.MeetingId,
                        principalTable: "Meetings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MeetingTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TaskTags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskTags_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedGroupId",
                table: "Tasks",
                column: "AssignedGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_AssignedGroupId",
                table: "Meetings",
                column: "AssignedGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Meetings_CreatedByUserId",
                table: "Meetings",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_AssignedGroupId",
                table: "Invoices",
                column: "AssignedGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CreatedByUserId",
                table: "Invoices",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_CustomerId",
                table: "CustomerTags",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTags_TagId",
                table: "CustomerTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_AssignedGroupId",
                table: "Customers",
                column: "AssignedGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_AssignedUserId",
                table: "Customers",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_CreatedByUserId",
                table: "Contracts",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_ResponsibleGroupId",
                table: "Contracts",
                column: "ResponsibleGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTags_ContractId",
                table: "ContractTags",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ContractTags_TagId",
                table: "ContractTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTags_InvoiceId",
                table: "InvoiceTags",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTags_TagId",
                table: "InvoiceTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingTags_MeetingId",
                table: "MeetingTags",
                column: "MeetingId");

            migrationBuilder.CreateIndex(
                name: "IX_MeetingTags_TagId",
                table: "MeetingTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskTags_TagId",
                table: "TaskTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskTags_TaskId",
                table: "TaskTags",
                column: "TaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Groups_ResponsibleGroupId",
                table: "Contracts",
                column: "ResponsibleGroupId",
                principalTable: "Groups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_users_CreatedByUserId",
                table: "Contracts",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Groups_AssignedGroupId",
                table: "Customers",
                column: "AssignedGroupId",
                principalTable: "Groups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_users_AssignedUserId",
                table: "Customers",
                column: "AssignedUserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerTags_Customers_CustomerId",
                table: "CustomerTags",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerTags_Tags_TagId",
                table: "CustomerTags",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Groups_AssignedGroupId",
                table: "Invoices",
                column: "AssignedGroupId",
                principalTable: "Groups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_users_CreatedByUserId",
                table: "Invoices",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_Groups_AssignedGroupId",
                table: "Meetings",
                column: "AssignedGroupId",
                principalTable: "Groups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Meetings_users_CreatedByUserId",
                table: "Meetings",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Groups_AssignedGroupId",
                table: "Tasks",
                column: "AssignedGroupId",
                principalTable: "Groups",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Groups_ResponsibleGroupId",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_users_CreatedByUserId",
                table: "Contracts");

            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Groups_AssignedGroupId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Customers_users_AssignedUserId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerTags_Customers_CustomerId",
                table: "CustomerTags");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomerTags_Tags_TagId",
                table: "CustomerTags");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Groups_AssignedGroupId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_users_CreatedByUserId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_Groups_AssignedGroupId",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Meetings_users_CreatedByUserId",
                table: "Meetings");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Groups_AssignedGroupId",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "ContractTags");

            migrationBuilder.DropTable(
                name: "InvoiceTags");

            migrationBuilder.DropTable(
                name: "MeetingTags");

            migrationBuilder.DropTable(
                name: "TaskTags");

            migrationBuilder.DropIndex(
                name: "IX_Tasks_AssignedGroupId",
                table: "Tasks");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_AssignedGroupId",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_Meetings_CreatedByUserId",
                table: "Meetings");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_AssignedGroupId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_CreatedByUserId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_CustomerTags_CustomerId",
                table: "CustomerTags");

            migrationBuilder.DropIndex(
                name: "IX_CustomerTags_TagId",
                table: "CustomerTags");

            migrationBuilder.DropIndex(
                name: "IX_Customers_AssignedGroupId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_AssignedUserId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_CreatedByUserId",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_ResponsibleGroupId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "AssignedGroupId",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "AssignedGroupId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "AssignedGroupId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "AssignedGroupId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "ResponsibleGroupId",
                table: "Contracts");
        }
    }
}
