import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCanonicalUrlToStgArticle1735816000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("stg_articles");

    if (!table) {
      throw new Error("stg_articles table not found");
    }

    // Add normalized_url column if it doesn't exist
    if (!table.findColumnByName("normalized_url")) {
      await queryRunner.addColumn(
        "stg_articles",
        new TableColumn({
          name: "normalized_url",
          type: "varchar",
          length: "512",
          isNullable: true,
        }),
      );
    }

    // Add canonical_url column if it doesn't exist
    if (!table.findColumnByName("canonical_url")) {
      await queryRunner.addColumn(
        "stg_articles",
        new TableColumn({
          name: "canonical_url",
          type: "varchar",
          length: "512",
          isNullable: true,
        }),
      );
    }

    // Create index on normalized_url for deduplication lookups
    const normalizedUrlIndex = table.indices.find((index) =>
      index.columnNames.includes("normalized_url"),
    );
    if (!normalizedUrlIndex) {
      await queryRunner.query(
        `CREATE INDEX idx_stg_articles_normalized_url ON stg_articles(normalized_url)`,
      );
    }

    // Create index on canonical_url for deduplication lookups
    const canonicalUrlIndex = table.indices.find((index) =>
      index.columnNames.includes("canonical_url"),
    );
    if (!canonicalUrlIndex) {
      await queryRunner.query(
        `CREATE INDEX idx_stg_articles_canonical_url ON stg_articles(canonical_url)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    const table = await queryRunner.getTable("stg_articles");
    if (table) {
      const normalizedUrlIndex = table.indices.find((index) =>
        index.name?.includes("normalized_url"),
      );
      if (normalizedUrlIndex) {
        await queryRunner.query(
          `DROP INDEX IF EXISTS idx_stg_articles_normalized_url`,
        );
      }

      const canonicalUrlIndex = table.indices.find((index) =>
        index.name?.includes("canonical_url"),
      );
      if (canonicalUrlIndex) {
        await queryRunner.query(
          `DROP INDEX IF EXISTS idx_stg_articles_canonical_url`,
        );
      }
    }

    // Drop columns
    await queryRunner.dropColumn("stg_articles", "normalized_url");
    await queryRunner.dropColumn("stg_articles", "canonical_url");
  }
}
