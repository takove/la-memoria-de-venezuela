import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateTier1Officials1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tier1_officials",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "external_id",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "full_name",
            type: "varchar",
            length: "200",
          },
          {
            name: "aliases",
            type: "jsonb",
            default: "'[]'",
          },
          {
            name: "nationality",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "date_of_birth",
            type: "date",
            isNullable: true,
          },
          {
            name: "sanctions_programs",
            type: "jsonb",
            default: "'[]'",
          },
          {
            name: "tier",
            type: "int",
            default: 1,
          },
          {
            name: "entity_type",
            type: "enum",
            enum: ["PERSON", "ORGANIZATION"],
            default: "'PERSON'",
          },
          {
            name: "source",
            type: "varchar",
            length: "50",
          },
          {
            name: "confidence_level",
            type: "int",
            default: 5,
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "verified_at",
            type: "timestamp",
          },
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
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      "tier1_officials",
      new TableIndex({
        name: "IDX_tier1_officials_full_name",
        columnNames: ["full_name"],
      }),
    );

    await queryRunner.createIndex(
      "tier1_officials",
      new TableIndex({
        name: "IDX_tier1_officials_external_id_source",
        columnNames: ["external_id", "source"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("tier1_officials", true);
  }
}
