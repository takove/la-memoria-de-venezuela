# Backend Development Context for Copilot

This file provides additional context for GitHub Copilot when working on the NestJS backend.

## Current Architecture

### API Structure

All endpoints are versioned under `/api/v1/`:

```
/api/v1/officials       - Officials CRUD
/api/v1/sanctions       - Sanctions management
/api/v1/cases           - Legal cases
/api/v1/search          - Full-text search
```

### Database Schema Summary

**Officials**
- `id` (UUID), `full_name`, `biography`, `status`, `confidence_level`
- Relations: positions, sanctions, caseInvolvements

**Sanctions**
- `id` (UUID), `official_id`, `type`, `program_name`, `reason`, `imposed_date`
- Types: ofac_sdn, ofac_ns_plc, eu, canada, uk, other

**Cases**
- `id` (UUID), `case_number`, `title`, `type`, `jurisdiction`, `filing_date`
- Types: indictment, criminal, civil, iachr, icc, other

**CaseInvolvements** (junction table)
- Links officials to cases with role and details
- Roles: defendant, witness, accused, convicted, mentioned

**Positions**
- Links officials to government positions with dates

### Common Patterns

#### Service Pattern
```typescript
@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}

  async findAll(options: FindOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['relatedEntities'],
    });
    
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    
    return entity;
  }
}
```

#### Controller Pattern
```typescript
@ApiTags('example')
@Controller('example')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiQuery({ name: 'page', required: false })
  findAll(@Query('page') page?: number) {
    return this.service.findAll({ page });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create entity' })
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }
}
```

### Database Connection

**CRITICAL**: Always use Supabase Session Pooler for connections.

```typescript
// .env file
DATABASE_URL=postgresql://postgres.gxepalgxlyohcgxzxcur:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres

// app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: false,
})
```

### Validation

Use class-validator decorators in DTOs:

```typescript
import { IsString, IsOptional, IsInt, Min, Max, Length } from 'class-validator';

export class CreateOfficialDto {
  @IsString()
  @Length(2, 200)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  biography?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel: number; // 1=rumor, 5=official
}
```

### Error Handling

Standard NestJS exceptions:
```typescript
import { 
  NotFoundException, 
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException 
} from '@nestjs/common';

// Use in services
throw new NotFoundException(`Official with ID ${id} not found`);
throw new BadRequestException('Invalid confidence level');
```

### Testing Pattern

```typescript
describe('OfficialsService', () => {
  let service: OfficialsService;
  let repository: Repository<Official>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficialsService,
        {
          provide: getRepositoryToken(Official),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OfficialsService>(OfficialsService);
    repository = module.get<Repository<Official>>(getRepositoryToken(Official));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find official by id', async () => {
    const mockOfficial = { id: '123', fullName: 'Test' };
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockOfficial as any);

    const result = await service.findOne('123');
    expect(result).toEqual(mockOfficial);
  });
});
```

## Next Features to Implement

1. **Confidence Level System** - Add confidence ratings (1-5) to all entities
2. **TIER 2: Testaferros** - Create entities for front men/straw men
3. **TIER 3: Businesses** - Add business entities linked to officials
4. **TIER 4: Cultural Figures** - Document regime propagandists
5. **Business Screening API** - Sanctions compliance endpoint
6. **Advanced Search** - Full-text search across all entities

## Common Commands

```bash
# Development
pnpm start:dev

# Build
pnpm build

# Tests
pnpm test
pnpm test:watch
pnpm test:cov

# Linting
pnpm lint
pnpm format
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# API
API_PREFIX=api/v1
```

## Important Notes

- Always use TypeORM repositories, never raw SQL
- All dates should be stored in UTC
- Use snake_case for database columns, camelCase for TypeScript
- Include both English and Spanish fields for user-facing content
- Add `@Index()` decorators for frequently queried fields
- Use UUIDs for all primary keys
- Include createdAt/updatedAt timestamps on all entities
