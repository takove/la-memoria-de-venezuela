import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["dist/entities/**/*.js"],
  migrations: ["dist/migrations/**/*.js"],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  logging: true,
});

async function runMigrations() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connection established");

    console.log("🔄 Running pending migrations...");
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log("✅ No pending migrations");
    } else {
      console.log(`✅ Ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }

    await AppDataSource.destroy();
    console.log("✅ Migration complete, connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
