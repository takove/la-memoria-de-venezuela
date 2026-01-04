import { INestApplication, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

const mockSearchResult = {
  officials: [{ id: "o1", fullName: "Nicolás Maduro" }],
  sanctions: [{ id: "s1", reason: "OFAC" }],
  cases: [{ id: "c1", title: "ICC" }],
  totalResults: 3,
};

const mockAutocomplete = [
  { id: "o1", name: "Nicolás Maduro", type: "official", photoUrl: "" },
];

const mockHighlighted = [{ id: "o1", fullName: "Nicolás Maduro" }];

const mockService = {
  search: jest.fn().mockResolvedValue(mockSearchResult),
  autocomplete: jest.fn().mockResolvedValue(mockAutocomplete),
  getHighlightedOfficials: jest.fn().mockResolvedValue(mockHighlighted),
};

describe("SearchController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /search calls service with defaults when no limit/types provided", async () => {
    const res = await request(app.getHttpServer())
      .get("/search?q=maduro")
      .expect(HttpStatus.OK);

    expect(res.body.totalResults).toBe(3);
    expect(mockService.search).toHaveBeenCalledWith({
      query: "maduro",
      limit: 10,
      types: undefined,
    });
  });

  it("GET /search parses limit and types correctly", async () => {
    await request(app.getHttpServer())
      .get("/search?q=test&limit=3&types=officials,sanctions")
      .expect(HttpStatus.OK);

    expect(mockService.search).toHaveBeenCalledWith({
      query: "test",
      limit: 3,
      types: ["officials", "sanctions"],
    });
  });

  it("GET /search/autocomplete uses default limit when omitted", async () => {
    const res = await request(app.getHttpServer())
      .get("/search/autocomplete?q=nic")
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(1);
    expect(mockService.autocomplete).toHaveBeenCalledWith("nic", 5);
  });

  it("GET /search/highlighted forwards limit", async () => {
    const res = await request(app.getHttpServer())
      .get("/search/highlighted?limit=4")
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(1);
    expect(mockService.getHighlightedOfficials).toHaveBeenCalledWith(4);
  });
});