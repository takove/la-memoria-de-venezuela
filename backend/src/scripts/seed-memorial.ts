// Seed initial memorial data. Run with: `npx ts-node src/scripts/seed-memorial.ts`.
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import {
  Victim,
  VictimCategory,
  ConfidenceLevel,
} from '../entities/victim.entity';
import {
  PoliticalPrisoner,
  PrisonerStatus,
  FacilityType,
} from '../entities/political-prisoner.entity';
import {
  ExileStory,
  ExileReason,
  JourneyRoute,
} from '../entities/exile-story.entity';

// Minimal helper to upsert by fullName (or displayName for anonymous exiles)
async function upsertVictim(dataSource: DataSource, payload: Partial<Victim>) {
  const repo = dataSource.getRepository(Victim);
  const existing = await repo.findOne({ where: { fullName: payload.fullName } });
  if (existing) {
    return repo.save({ ...existing, ...payload });
  }
  const created = repo.create(payload);
  return repo.save(created);
}

async function upsertPrisoner(dataSource: DataSource, payload: Partial<PoliticalPrisoner>) {
  const repo = dataSource.getRepository(PoliticalPrisoner);
  const existing = await repo.findOne({ where: { fullName: payload.fullName } });
  if (existing) {
    return repo.save({ ...existing, ...payload });
  }
  const created = repo.create(payload);
  return repo.save(created);
}

async function upsertExileStory(dataSource: DataSource, payload: Partial<ExileStory>) {
  const repo = dataSource.getRepository(ExileStory);
  const uniqueKey = payload.displayName || payload.fullName;
  const existing = uniqueKey
    ? await repo.findOne({ where: [{ displayName: uniqueKey }, { fullName: uniqueKey }] })
    : null;
  if (existing) {
    return repo.save({ ...existing, ...payload });
  }
  const created = repo.create(payload);
  return repo.save(created);
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  const dataSource = app.get(DataSource);

  // ==================== Victims (2017 protests) ====================
  const victims: Partial<Victim>[] = [
    {
      fullName: 'Juan Pablo Pernalete',
      firstName: 'Juan Pablo',
      lastName: 'Pernalete',
      age: 20,
      dateOfDeath: new Date('2017-04-26'),
      placeOfDeath: 'Altamira, Caracas',
      category: VictimCategory.PROTEST,
      circumstance:
        'Impactado en el pecho por una granada de gas lacrimógeno disparada a quemarropa durante protesta.',
      circumstanceEs:
        'Impactado en el pecho por una granada de gas lacrimógeno disparada a quemarropa durante protesta.',
      biographyEs: 'Estudiante de la Universidad Metropolitana, jugador de baloncesto.',
      confidenceLevel: ConfidenceLevel.MULTIPLE_REPORTS,
      evidenceSources: [
        {
          type: 'news_article',
          title: 'Crackdown on Dissent – HRW (2017)',
          url: 'https://www.hrw.org/report/2017/11/29/crackdown-dissent/brutality-torture-and-political-persecution-venezuela',
          organization: 'Human Rights Watch',
        },
        {
          type: 'news_article',
          title: 'Reuters: Protester killed in Caracas demo (Apr 27, 2017)',
          url: 'https://www.reuters.com/article/us-venezuela-protests-idUSKBN17S2SN',
          organization: 'Reuters',
        },
      ],
      internationalReports: ['HRW 2017 crackdown report'],
      tributeMessageEs: 'No se apagará tu voz.',
      anonymous: false,
      familyConsent: false,
    },
    {
      fullName: 'Neomar Lander',
      firstName: 'Neomar',
      lastName: 'Lander',
      age: 17,
      dateOfDeath: new Date('2017-06-07'),
      placeOfDeath: 'Chacao, Caracas',
      category: VictimCategory.PROTEST,
      circumstance:
        'Murió por impacto de explosivo durante enfrentamientos con fuerzas de seguridad en protesta.',
      circumstanceEs:
        'Murió por impacto de explosivo durante enfrentamientos con fuerzas de seguridad en protesta.',
      biographyEs: 'Joven manifestante de 17 años que participaba activamente en las protestas de 2017.',
      confidenceLevel: ConfidenceLevel.MULTIPLE_REPORTS,
      evidenceSources: [
        {
          type: 'news_article',
          title: 'BBC: Venezuela protester killed in clashes (June 2017)',
          url: 'https://www.bbc.com/news/world-latin-america-40209783',
          organization: 'BBC',
        },
        {
          type: 'news_article',
          title: 'HRW: Crackdown on Dissent (2017)',
          url: 'https://www.hrw.org/report/2017/11/29/crackdown-dissent/brutality-torture-and-political-persecution-venezuela',
          organization: 'Human Rights Watch',
        },
      ],
      tributeMessageEs: 'Tu valentía no será olvidada.',
      anonymous: false,
      familyConsent: false,
    },
    {
      fullName: 'Paola Ramírez',
      firstName: 'Paola',
      lastName: 'Ramírez',
      age: 23,
      dateOfDeath: new Date('2017-04-19'),
      placeOfDeath: 'San Cristóbal, Táchira',
      category: VictimCategory.PROTEST,
      circumstance:
        'Asesinada por disparos de colectivos motorizados mientras huía de enfrentamientos en protesta.',
      circumstanceEs:
        'Asesinada por disparos de colectivos motorizados mientras huía de enfrentamientos en protesta.',
      biographyEs: 'Estudiante y deportista en San Cristóbal.',
      confidenceLevel: ConfidenceLevel.MULTIPLE_REPORTS,
      evidenceSources: [
        {
          type: 'news_article',
          title: 'Reuters: Protest deaths mount in Venezuela (Apr 20, 2017)',
          url: 'https://www.reuters.com/article/us-venezuela-politics-idUSKBN17L2QW',
          organization: 'Reuters',
        },
        {
          type: 'news_article',
          title: 'Amnesty: More than a dozen people killed in protests (2017)',
          url: 'https://www.amnestyusa.org/press-releases/more-than-a-dozen-people-killed-in-protests-in-venezuela/',
          organization: 'Amnesty International',
        },
      ],
      tributeMessageEs: 'Tu nombre vive en nuestra memoria.',
      anonymous: false,
      familyConsent: false,
    },
  ];

  // ==================== Political Prisoners ====================
  const prisoners: Partial<PoliticalPrisoner>[] = [
    {
      fullName: 'Roland Carreño',
      firstName: 'Roland',
      lastName: 'Carreño',
      profession: 'Periodista (El Nacional, Venevisión, Globovisión)',
      status: PrisonerStatus.RELEASED,
      dateArrested: new Date('2020-10-26'),
      dateReleased: new Date('2023-10-01'),
      facilities: ['SEBIN El Helicoide'],
      primaryFacilityType: FacilityType.SEBIN,
      charges: [
        'financiamiento al terrorismo',
        'asociación para delinquir',
        'legitimación de capitales',
        'tráfico ilícito de armas de guerra',
      ],
      chargesDescriptionEs:
        'Detenido por la Policía Nacional Bolivariana; presentado con cargos de terrorismo y armas; organizaciones de DDHH lo catalogan como detención arbitraria.',
      legalStatus: 'released',
      torture: false,
      solitaryConfinement: false,
      medicalAttentionDenied: false,
      familyVisitsDenied: true,
      biographyEs:
        'Periodista y coordinador nacional de Voluntad Popular. Fue detenido en 2020 y liberado en 2023, denunciando condiciones de detención arbitraria.',
      confidenceLevel: 4,
      evidenceSources: [
        {
          type: 'news',
          title: 'RSF: Venezuelan journalist completes 12 months of arbitrary detention',
          url: 'https://rsf.org/en/venezuelan-journalist-completes-12-months-arbitrary-detention',
          organization: 'Reporters Sans Frontières',
          date: '2021-10-26',
        },
        {
          type: 'amnesty',
          title: 'Amnesty petition: Free wrongly imprisoned in Venezuela',
          url: 'https://www.amnesty.org/en/petition/free-the-wrongly-imprisoned-in-venezuela/',
          organization: 'Amnesty International',
        },
      ],
      responsibleEntities: 'PNB / SEBIN',
      anonymous: false,
      familyConsent: false,
    },
    {
      fullName: 'Javier Tarazona',
      firstName: 'Javier',
      lastName: 'Tarazona',
      profession: 'Director de FundaRedes',
      status: PrisonerStatus.RELEASED,
      dateArrested: new Date('2021-07-02'),
      dateReleased: new Date('2023-10-01'),
      facilities: ['SEBIN El Helicoide'],
      primaryFacilityType: FacilityType.SEBIN,
      charges: ['terrorismo', 'incitación al odio'],
      chargesDescriptionEs:
        'Detenido cuando denunciaba hostigamiento de SEBIN; acusado de terrorismo e incitación al odio por su labor de documentación en zonas fronterizas.',
      legalStatus: 'released',
      torture: false,
      solitaryConfinement: false,
      medicalAttentionDenied: true,
      familyVisitsDenied: true,
      biographyEs:
        'Defensor de derechos humanos y educador. Director de FundaRedes, documentó presencia de grupos armados en frontera. Pasó más de dos años detenido.',
      confidenceLevel: 4,
      evidenceSources: [
        {
          type: 'amnesty',
          title: 'Amnesty Urgent Action: Release Javier Tarazona',
          url: 'https://www.amnesty.org/ar/wp-content/uploads/2022/11/AMR5351212021ENGLISH.pdf',
          organization: 'Amnesty International',
          date: '2022-11-01',
        },
        {
          type: 'un_report',
          title: 'IACHR precautionary measures MC-258-20 (Tarazona)',
          url: 'https://www.oas.org/en/iachr/decisions/mc/2022/res_60-22_mc_258-20_ve_en.pdf',
          organization: 'IACHR',
        },
      ],
      responsibleEntities: 'SEBIN',
      anonymous: false,
      familyConsent: false,
    },
  ];

  // ==================== Exile Stories (Darién, anonymized for safety) ====================
  const exiles: Partial<ExileStory>[] = [
    {
      displayName: 'Migrante venezolano anónimo (Darién 2023)',
      fullName: undefined,
      anonymous: true,
      yearLeft: 2023,
      monthLeft: 8,
      reason: ExileReason.ECONOMIC,
      reasonDetailEs: 'Salió por falta de alimentos, medicinas y empleo.',
      journeyRoute: JourneyRoute.DARIEN_GAP,
      journeyDescriptionEs: 'Cruzó la selva del Darién en 10 días con su familia, enfrentando ríos y extorsión.',
      countriesCrossed: ['Colombia', 'Panamá', 'Costa Rica', 'México'],
      journeyDays: 10,
      destination: 'Estados Unidos',
      destinationCity: 'Houston',
      currentStatus: 'asylum_seeker',
      familySeparated: true,
      familySituation: 'Dejó a su madre en Venezuela; viajó con pareja e hijo.',
      careerLost: true,
      careerDescription: 'Dejó trabajo informal en Caracas; busca empleo estable.',
      storyEs: '“No había medicinas para mi hijo. Preferimos arriesgarnos en la selva que quedarnos sin nada.”',
      messageToVenezuelaEs: 'Resistamos y documentemos, para que el mundo sepa lo que vivimos.',
      confidenceLevel: 3,
      evidenceSources: [
        {
          type: 'organization',
          description: 'Reuters: Venezuelans now majority of Darien Gap crossings (Sept 2023)',
          url: 'https://www.reuters.com/world/americas/venezuelans-are-now-majority-migrants-crossing-dariens-treacherous-gap-2023-09-29/',
          date: '2023-09-29',
        },
      ],
    },
    {
      displayName: 'Familia venezolana anónima (Darién 2024)',
      fullName: undefined,
      anonymous: true,
      yearLeft: 2024,
      monthLeft: 4,
      reason: ExileReason.MIXED,
      reasonDetailEs: 'Amenazas de colectivos y colapso económico.',
      journeyRoute: JourneyRoute.DARIEN_GAP,
      journeyDescriptionEs: 'Cruzaron el Darién en 7 días guiados por coyotes; presenciaron muertes en la ruta.',
      countriesCrossed: ['Colombia', 'Panamá', 'Guatemala', 'México'],
      journeyDays: 7,
      destination: 'Estados Unidos',
      destinationCity: 'Miami',
      currentStatus: 'asylum_seeker',
      familySeparated: false,
      careerLost: true,
      careerDescription: 'Padre era técnico electricista; madre trabajaba en comercio informal.',
      storyEs: '“Vimos niños arrastrados por el río. No hay vuelta atrás cuando entras al Darién.”',
      messageToVenezuelaEs: 'Que se sepa lo que le hacen a nuestro pueblo: obligarnos a huir.',
      confidenceLevel: 3,
      evidenceSources: [
        {
          type: 'organization',
          description: 'AP: Migrants risk Darién Gap as Venezuelan exodus continues (2024 feature)',
          url: 'https://apnews.com/article/darien-gap-migrants-venezuela-2024',
          date: '2024-05-01',
        },
      ],
    },
  ];

  // Execute upserts
  for (const v of victims) {
    await upsertVictim(dataSource, v);
    console.log(`Seeded victim: ${v.fullName}`);
  }

  for (const p of prisoners) {
    await upsertPrisoner(dataSource, p);
    console.log(`Seeded prisoner: ${p.fullName}`);
  }

  for (const e of exiles) {
    await upsertExileStory(dataSource, e);
    console.log(`Seeded exile story: ${e.displayName || e.fullName}`);
  }

  await app.close();
  console.log('✅ Memorial seed completed');
}

seed().catch((err) => {
  console.error('Seed error', err);
  process.exit(1);
});
