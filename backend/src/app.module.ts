import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficialsModule } from './modules/officials/officials.module';
import { SanctionsModule } from './modules/sanctions/sanctions.module';
import { CasesModule } from './modules/cases/cases.module';
import { SearchModule } from './modules/search/search.module';
import { MemorialModule } from './modules/memorial/memorial.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl:
          configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // Feature Modules
    OfficialsModule,
    SanctionsModule,
    CasesModule,
    SearchModule,
    MemorialModule, // "This is why we exist" - Victims Memorial
  ],
})
export class AppModule {}
