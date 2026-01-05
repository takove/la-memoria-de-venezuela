import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateBusinessTable1735526400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "businesses",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
            length: "500",
            isNullable: false,
          },
          {
            name: "registration_number",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "country",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "industry",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "category",
            type: "enum",
            enum: [
              "pdvsa_contractor",
              "clap_fraud",
              "infrastructure",
              "financial",
              "energy",
              "food_distribution",
              "import_export",
              "real_estate",
              "mining",
              "other",
            ],
            default: "'other'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "inactive", "dissolved", "sanctioned", "unknown"],
            default: "'unknown'",
          },
          {
            name: "aliases",
            type: "text",
            isArray: true,
            isNullable: true,
          },
          {
            name: "estimated_contract_value",
            type: "numeric",
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: "estimated_theft_amount",
            type: "numeric",
            precision: 15,
            scale: 2,
            isNullable: true,
          },
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
          {
            name: "beneficial_owner_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "front_man",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "contracts",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "sanctions",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "evidence_sources",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "confidence_level",
            type: "integer",
            default: 1,
          },
          {
            name: "is_disputed",
            type: "boolean",
            default: false,
          },
          {
            name: "dispute_details",
            type: "text",
            isNullable: true,
          },
          {
            name: "dissolution_date",
            type: "date",
            isNullable: true,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    // Create foreign key to officials
    await queryRunner.createForeignKey(
      "businesses",
      new TableForeignKey({
        columnNames: ["beneficial_owner_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "officials",
        onDelete: "SET NULL",
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["name"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["registration_number"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["country"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["category"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["confidence_level"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["beneficial_owner_id"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["estimated_contract_value"],
      }),
    );

    await queryRunner.createIndex(
      "businesses",
      new TableIndex({
        columnNames: ["estimated_theft_amount"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (which will cascade delete foreign keys)
    await queryRunner.dropTable("businesses");
  }
}
