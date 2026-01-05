import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSourcesAndConfidence1736086800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add sources and confidence_level to officials table
    await queryRunner.addColumn(
      "officials",
      new TableColumn({
        name: "sources",
        type: "jsonb",
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      "officials",
      new TableColumn({
        name: "confidence_level",
        type: "integer",
        default: 3,
      }),
    );

    // Add sources and confidence_level to sanctions table
    await queryRunner.addColumn(
      "sanctions",
      new TableColumn({
        name: "sources",
        type: "jsonb",
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      "sanctions",
      new TableColumn({
        name: "confidence_level",
        type: "integer",
        default: 3,
      }),
    );

    // Update businesses table: rename evidence_sources to sources and update confidence_level default
    // First, add new sources column
    await queryRunner.addColumn(
      "businesses",
      new TableColumn({
        name: "sources",
        type: "jsonb",
        isNullable: true,
      }),
    );

    // Copy data from evidence_sources to sources
    await queryRunner.query(`
      UPDATE businesses 
      SET sources = evidence_sources 
      WHERE evidence_sources IS NOT NULL
    `);

    // Drop old evidence_sources column
    await queryRunner.dropColumn("businesses", "evidence_sources");

    // Update confidence_level default from 1 to 3
    await queryRunner.changeColumn(
      "businesses",
      "confidence_level",
      new TableColumn({
        name: "confidence_level",
        type: "integer",
        default: 3,
      }),
    );

    // Add sources to testaferros table
    await queryRunner.addColumn(
      "testaferros",
      new TableColumn({
        name: "sources",
        type: "jsonb",
        isNullable: true,
      }),
    );

    // Update confidence_level column name in testaferros (if needed)
    // The entity uses confidence_level but let's verify it exists
    const testaferrosTable = await queryRunner.getTable("testaferros");
    const confidenceLevelColumn =
      testaferrosTable?.findColumnByName("confidence_level");

    if (!confidenceLevelColumn) {
      // If column doesn't exist, create it
      await queryRunner.addColumn(
        "testaferros",
        new TableColumn({
          name: "confidence_level",
          type: "integer",
          default: 3,
        }),
      );
    }

    // Create indexes for confidence_level on all tables
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_officials_confidence_level" 
      ON "officials" ("confidence_level")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sanctions_confidence_level" 
      ON "sanctions" ("confidence_level")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_businesses_confidence_level" 
      ON "businesses" ("confidence_level")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_testaferros_confidence_level" 
      ON "testaferros" ("confidence_level")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_officials_confidence_level"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_sanctions_confidence_level"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_businesses_confidence_level"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_testaferros_confidence_level"`,
    );

    // Remove sources and confidence_level from officials
    await queryRunner.dropColumn("officials", "sources");
    await queryRunner.dropColumn("officials", "confidence_level");

    // Remove sources and confidence_level from sanctions
    await queryRunner.dropColumn("sanctions", "sources");
    await queryRunner.dropColumn("sanctions", "confidence_level");

    // Restore businesses: add back evidence_sources, revert confidence_level
    await queryRunner.addColumn(
      "businesses",
      new TableColumn({
        name: "evidence_sources",
        type: "jsonb",
        isNullable: true,
      }),
    );

    await queryRunner.query(`
      UPDATE businesses 
      SET evidence_sources = sources 
      WHERE sources IS NOT NULL
    `);

    await queryRunner.dropColumn("businesses", "sources");

    await queryRunner.changeColumn(
      "businesses",
      "confidence_level",
      new TableColumn({
        name: "confidence_level",
        type: "integer",
        default: 1,
      }),
    );

    // Remove sources from testaferros
    await queryRunner.dropColumn("testaferros", "sources");
  }
}
