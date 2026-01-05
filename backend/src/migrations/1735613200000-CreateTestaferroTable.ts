import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTestaferroTable1735613200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "testaferros",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },

          // Identity
          {
            name: "full_name",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "aliases",
            type: "text",
            isNullable: true,
            comment: "JSON array: [{alias: string}]",
          },
          {
            name: "identification_number",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "identification_type",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "date_of_birth",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "nationality",
            type: "varchar",
            length: "100",
            isNullable: true,
          },

          // Relationship to Official
          {
            name: "beneficial_owner_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "relationship_to_official",
            type: "text",
            isNullable: true,
          },
          {
            name: "relationship_to_official_es",
            type: "text",
            isNullable: true,
          },

          // Categorization
          {
            name: "category",
            type: "enum",
            enum: [
              "money_launderer",
              "business_front",
              "shell_company_operator",
              "real_estate_flipper",
              "import_export_trader",
              "banking_intermediary",
              "construction_contractor",
              "family_member",
              "childhood_friend",
              "business_associate",
              "other",
            ],
            default: "'business_front'",
          },
          {
            name: "status",
            type: "enum",
            enum: [
              "active",
              "inactive",
              "deceased",
              "captured",
              "fled_country",
              "cooperating_witness",
            ],
            default: "'active'",
          },
          {
            name: "status_notes",
            type: "text",
            isNullable: true,
          },

          // Description
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "description_es",
            type: "text",
            isNullable: true,
          },

          // Location
          {
            name: "country",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "known_residencies",
            type: "text",
            isNullable: true,
            comment: "JSON: [{country, period, role}]",
          },

          // Wealth & Assets
          {
            name: "estimated_wealth_amount",
            type: "bigint",
            isNullable: true,
            default: 0,
          },
          {
            name: "known_assets",
            type: "text",
            isNullable: true,
            comment: "JSON: [{type, description, value}]",
          },
          {
            name: "bank_accounts",
            type: "text",
            isNullable: true,
            comment: "JSON: [{bank, country, status, amount}]",
          },

          // Business Holdings
          {
            name: "business_stakes",
            type: "text",
            isNullable: true,
            comment: "JSON: [{business_id, percentage, role}]",
          },

          // Financial Networks
          {
            name: "banking_connections",
            type: "text",
            isNullable: true,
            comment: "JSON: [{bank, country, type, status}]",
          },
          {
            name: "trading_partners",
            type: "text",
            isNullable: true,
          },
          {
            name: "known_associates",
            type: "text",
            isNullable: true,
            comment: "JSON: [{type, name, relationship}]",
          },

          // Legal Proceedings
          {
            name: "indictments",
            type: "text",
            isNullable: true,
            comment: "JSON: [{jurisdiction, date, charges, status}]",
          },
          {
            name: "sanctions",
            type: "text",
            isNullable: true,
            comment: "JSON: [{type, date, reason}]",
          },
          {
            name: "cases_involvement",
            type: "text",
            isNullable: true,
            comment: "JSON: [{case_id, role, outcome}]",
          },

          // Confidence & Verification
          {
            name: "confidence_level",
            type: "int",
            default: 3,
          },
          {
            name: "evidence_sources",
            type: "text",
            isNullable: true,
            comment: "JSON: [{type, title, url, publisher, date}]",
          },

          // Dispute & Corrections
          {
            name: "is_disputed",
            type: "boolean",
            default: false,
          },
          {
            name: "dispute_notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "dissolution_date",
            type: "date",
            isNullable: true,
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },

          // Timestamps
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["beneficial_owner_id"],
            referencedTableName: "officials",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],
      }),
      true,
    );

    // Create indexes for fast searches
    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_full_name",
        columnNames: ["full_name"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_identification",
        columnNames: ["identification_number"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_category_status",
        columnNames: ["category", "status"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_beneficial_owner",
        columnNames: ["beneficial_owner_id"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_confidence",
        columnNames: ["confidence_level"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_country",
        columnNames: ["country"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_wealth",
        columnNames: ["estimated_wealth_amount"],
      }),
    );

    await queryRunner.createIndex(
      "testaferros",
      new TableIndex({
        name: "idx_testaferros_created",
        columnNames: ["created_at"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("testaferros");
  }
}
