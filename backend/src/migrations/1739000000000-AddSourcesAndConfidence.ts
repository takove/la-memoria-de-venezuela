import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourcesAndConfidence1739000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"officials_confidence_level_enum\" AS ENUM ('1', '2', '3', '4', '5')",
    );
    await queryRunner.query(
      "CREATE TYPE \"businesses_confidence_level_enum\" AS ENUM ('1', '2', '3', '4', '5')",
    );
    await queryRunner.query(
      "CREATE TYPE \"testaferros_confidence_level_enum\" AS ENUM ('1', '2', '3', '4', '5')",
    );
    await queryRunner.query(
      "CREATE TYPE \"sanctions_confidence_level_enum\" AS ENUM ('1', '2', '3', '4', '5')",
    );

    await queryRunner.query(
      'ALTER TABLE "officials" ADD "sources" jsonb DEFAULT \'[]\'',
    );
    await queryRunner.query(
      'ALTER TABLE "officials" ADD "confidence_level" "officials_confidence_level_enum" NOT NULL DEFAULT \'3\'',
    );

    await queryRunner.query(
      'ALTER TABLE "businesses" ADD "sources" jsonb DEFAULT \'[]\'',
    );
    await queryRunner.query(
      'ALTER TABLE "businesses" ALTER COLUMN "confidence_level" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "businesses" ALTER COLUMN "confidence_level" TYPE "businesses_confidence_level_enum" USING "confidence_level"::text::"businesses_confidence_level_enum"',
    );
    await queryRunner.query(
      'ALTER TABLE "businesses" ALTER COLUMN "confidence_level" SET DEFAULT \'3\'',
    );

    await queryRunner.query(
      'ALTER TABLE "testaferros" ADD "sources" jsonb DEFAULT \'[]\'',
    );
    await queryRunner.query(
      'ALTER TABLE "testaferros" ALTER COLUMN "confidence_level" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "testaferros" ALTER COLUMN "confidence_level" TYPE "testaferros_confidence_level_enum" USING "confidence_level"::text::"testaferros_confidence_level_enum"',
    );
    await queryRunner.query(
      'ALTER TABLE "testaferros" ALTER COLUMN "confidence_level" SET DEFAULT \'3\'',
    );

    await queryRunner.query(
      'ALTER TABLE "sanctions" ADD "sources" jsonb DEFAULT \'[]\'',
    );
    await queryRunner.query(
      'ALTER TABLE "sanctions" ADD "confidence_level" "sanctions_confidence_level_enum" NOT NULL DEFAULT \'3\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "sanctions" DROP COLUMN "confidence_level"',
    );
    await queryRunner.query('ALTER TABLE "sanctions" DROP COLUMN "sources"');
    await queryRunner.query('DROP TYPE "sanctions_confidence_level_enum"');

    await queryRunner.query(
      'ALTER TABLE "testaferros" ALTER COLUMN "confidence_level" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "testaferros" ALTER COLUMN "confidence_level" TYPE integer USING "confidence_level"::text::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "testaferros" ALTER COLUMN "confidence_level" SET DEFAULT 3',
    );
    await queryRunner.query('ALTER TABLE "testaferros" DROP COLUMN "sources"');
    await queryRunner.query('DROP TYPE "testaferros_confidence_level_enum"');

    await queryRunner.query(
      'ALTER TABLE "businesses" ALTER COLUMN "confidence_level" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "businesses" ALTER COLUMN "confidence_level" TYPE integer USING "confidence_level"::text::integer',
    );
    await queryRunner.query(
      'ALTER TABLE "businesses" ALTER COLUMN "confidence_level" SET DEFAULT 1',
    );
    await queryRunner.query('ALTER TABLE "businesses" DROP COLUMN "sources"');
    await queryRunner.query('DROP TYPE "businesses_confidence_level_enum"');

    await queryRunner.query(
      'ALTER TABLE "officials" DROP COLUMN "confidence_level"',
    );
    await queryRunner.query('ALTER TABLE "officials" DROP COLUMN "sources"');
    await queryRunner.query('DROP TYPE "officials_confidence_level_enum"');
  }
}
