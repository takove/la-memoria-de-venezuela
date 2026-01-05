import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { OfficialsModule } from "./modules/officials/officials.module";
import { SanctionsModule } from "./modules/sanctions/sanctions.module";
import { CasesModule } from "./modules/cases/cases.module";
import { SearchModule } from "./modules/search/search.module";
import { MemorialModule } from "./modules/memorial/memorial.module";
import { BusinessesModule } from "./modules/businesses/businesses.module";
import { TestaferrosModule } from "./modules/testaferros/testaferros.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { Tier1Module } from "./modules/ingestion/tier1/tier1.module";
import { EventsModule } from "./modules/events/events.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get("NODE_ENV") === "development",
        ssl:
          configService.get("NODE_ENV") === "production"
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // BullMQ Redis Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get("REDIS_HOST") || "localhost";
        const port = configService.get("REDIS_PORT") || 6379;
        const password = configService.get("REDIS_PASSWORD");
        const useTls =
          (configService.get("REDIS_USE_TLS") || "false").toString() === "true";

        return {
          connection: {
            host,
            port,
            password: password || undefined,
            tls: useTls ? {} : undefined,
          },
        };
      },
    }),

    // Feature Modules
    OfficialsModule,
    SanctionsModule,
    CasesModule,
    SearchModule,
    MemorialModule, // "This is why we exist" - Victims Memorial
    BusinessesModule, // TIER 3: Business Enablers (PDVSA contractors, CLAP fraud, shell companies)
    TestaferrosModule, // TIER 2: Testaferros (money launderers, front men, shell company operators)
    IngestionModule, // Investigative ingestion pipeline with RSS + BullMQ
    Tier1Module, // Tier 1 sanctions list matching (OFAC, OpenSanctions)
    EventsModule, // Timeline events (sanctions, charges, convictions, position changes)
  ],
})
export class AppModule {}
