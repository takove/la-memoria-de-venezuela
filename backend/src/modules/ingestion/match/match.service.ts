import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Official,
  StgEntity,
  StgNode,
  StgNodeType,
  StgEdge,
  StgEdgeType,
} from "../../../entities";

export interface NodeMappingDto {
  type: StgNodeType;
  canonicalName: string;
  altNames?: string[];
  sourceIds?: Record<string, any>;
  tier1Id?: string;
}

export interface EdgeMappingDto {
  srcNodeId: string;
  dstNodeId: string;
  type: StgEdgeType;
  weight?: number;
  evidenceRef?: Record<string, any>;
}

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectRepository(StgNode)
    private nodesRepository: Repository<StgNode>,
    @InjectRepository(StgEdge)
    private edgesRepository: Repository<StgEdge>,
    @InjectRepository(StgEntity)
    private entitiesRepository: Repository<StgEntity>,
    @InjectRepository(Official)
    private officialsRepository: Repository<Official>,
  ) {}

  /**
   * Create or update a node in the graph.
   */
  async upsertNode(dto: NodeMappingDto): Promise<StgNode> {
    const normalized = this.normalizeText(dto.canonicalName);

    // Ensure altNames is a clean string[] (Postgres text[] cannot accept JSON string literals)
    const sanitizeAltNames = (input?: string[] | string | null): string[] => {
      if (!input) return [];
      if (Array.isArray(input))
        return input.map((n) => n.trim()).filter(Boolean);
      if (typeof input === "string") {
        try {
          const parsed = JSON.parse(input);
          return Array.isArray(parsed)
            ? parsed.map((n) => String(n).trim()).filter(Boolean)
            : [];
        } catch {
          return [input.trim()].filter(Boolean);
        }
      }
      return [];
    };

    const incomingAltNames = sanitizeAltNames(dto.altNames);

    let node = await this.nodesRepository.findOne({
      where: { canonicalName: normalized, type: dto.type },
    });

    if (node) {
      // Update with new alt names and source IDs
      if (incomingAltNames.length) {
        const existing = sanitizeAltNames(node.altNames);
        node.altNames = Array.from(new Set([...existing, ...incomingAltNames]));
      }
      if (dto.sourceIds) {
        node.sourceIds = { ...node.sourceIds, ...dto.sourceIds };
      }
      if (dto.tier1Id && !node.tier1) {
        const tier1 = await this.officialsRepository.findOne({
          where: { id: dto.tier1Id },
        });
        if (tier1) node.tier1 = tier1;
      }
    } else {
      const tier1 = dto.tier1Id
        ? await this.officialsRepository.findOne({
            where: { id: dto.tier1Id },
          })
        : null;

      node = new StgNode();
      node.type = dto.type;
      node.canonicalName = normalized;
      node.altNames =
        incomingAltNames.length > 0 ? incomingAltNames : undefined;
      node.sourceIds = dto.sourceIds;
      if (tier1) node.tier1 = tier1;
    }

    const saved = await this.nodesRepository.save(node);
    return saved;
  }

  /**
   * Create or update an edge in the graph.
   */
  async upsertEdge(dto: EdgeMappingDto): Promise<StgEdge> {
    let edge = await this.edgesRepository.findOne({
      where: {
        srcNode: { id: dto.srcNodeId },
        dstNode: { id: dto.dstNodeId },
        type: dto.type,
      },
    });

    if (edge) {
      if (dto.weight) edge.weight = dto.weight;
      if (dto.evidenceRef) edge.evidenceRef = dto.evidenceRef;
    } else {
      const srcNode = await this.nodesRepository.findOne({
        where: { id: dto.srcNodeId },
      });
      const dstNode = await this.nodesRepository.findOne({
        where: { id: dto.dstNodeId },
      });

      if (!srcNode || !dstNode) {
        throw new Error("Source or destination node not found");
      }

      edge = this.edgesRepository.create({
        srcNode,
        dstNode,
        type: dto.type,
        weight: dto.weight,
        evidenceRef: dto.evidenceRef,
      });
    }

    return this.edgesRepository.save(edge);
  }

  /**
   * Deterministic match: find Tier 1 official by normalized full name.
   */
  async matchTier1ByName(name: string): Promise<Official | null> {
    const normalized = this.normalizeText(name);
    const official = await this.officialsRepository
      .createQueryBuilder("o")
      .where("UPPER(REPLACE(o.full_name, ' ', '')) = :normalized", {
        normalized: normalized.replace(/\s/g, ""),
      })
      .orWhere(":alias = ANY(o.aliases)", { alias: name })
      .take(1)
      .getOne();

    return official || null;
  }

  /**
   * Fuzzy match: Jaro-Winkler similarity >= threshold.
   * Simplified placeholder using substring matching.
   */
  async fuzzyMatchTier1(
    name: string,
    threshold = 0.92,
  ): Promise<Official | null> {
    const normalized = this.normalizeText(name);
    const words = normalized.split(/\s+/);

    // Simple heuristic: match officials with most name words in common
    const officials = await this.officialsRepository
      .createQueryBuilder("o")
      .where("o.nationality = :nationality OR o.nationality IS NULL", {
        nationality: "Venezuelan", // Placeholder
      })
      .take(20)
      .getMany();

    let bestMatch: Official | null = null;
    let bestScore = 0;

    for (const official of officials) {
      const officialWords = this.normalizeText(official.fullName).split(/\s+/);
      const commonWords = words.filter((w) =>
        officialWords.some((ow) => ow.includes(w)),
      );
      const score =
        commonWords.length / Math.max(words.length, officialWords.length);

      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = official;
      }
    }

    return bestMatch || null;
  }

  /**
   * Normalize text: uppercase, remove accents.
   */
  private normalizeText(text: string): string {
    return text
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
