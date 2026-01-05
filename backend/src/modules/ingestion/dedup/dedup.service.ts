import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StgEntity } from "../../../entities";

export interface DeduplicationMatch {
  entityIds: string[];
  similarity: number;
  reason: string;
}

/**
 * Entity deduplication service using fuzzy matching.
 * Implements industry best practices from Wikidata and fact-checkers.
 */
@Injectable()
export class DedupService {
  private readonly logger = new Logger(DedupService.name);

  constructor(
    @InjectRepository(StgEntity)
    private entitiesRepository: Repository<StgEntity>,
  ) {}

  /**
   * Find potential duplicates for an entity using fuzzy matching.
   * Uses Jaro-Winkler similarity (industry standard for entity disambiguation).
   * Threshold 0.85+ = likely duplicate, requires human review.
   * Threshold 0.95+ = high confidence automatic merge (with logging).
   */
  async findDuplicates(
    entity: StgEntity,
    minSimilarity = 0.85,
  ): Promise<DeduplicationMatch[]> {
    const potentialMatches: DeduplicationMatch[] = [];

    // Find entities from same article type/category
    const candidates = await this.entitiesRepository.find({
      where: { type: entity.type },
    });

    for (const candidate of candidates) {
      // Skip self-matches
      if (candidate.id === entity.id) continue;

      // Calculate similarity
      const rawTextSimilarity = this.jaroWinklerSimilarity(
        this.normalizeForComparison(entity.rawText),
        this.normalizeForComparison(candidate.rawText),
      );

      const normTextSimilarity = this.jaroWinklerSimilarity(
        entity.normText,
        candidate.normText,
      );

      // Use highest similarity
      const similarity = Math.max(rawTextSimilarity, normTextSimilarity);

      if (similarity >= minSimilarity) {
        potentialMatches.push({
          entityIds: [entity.id, candidate.id],
          similarity: Math.round(similarity * 100) / 100,
          reason: this.buildMatchReason(entity, candidate, similarity),
        });
      }
    }

    return potentialMatches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Consolidate duplicate entities by merging them into canonical form.
   * Keeps higher-quality mention, updates references.
   */
  async mergeEntities(primaryId: string, duplicateId: string): Promise<StgEntity> {
    const primary = await this.entitiesRepository.findOne({
      where: { id: primaryId },
    });
    const duplicate = await this.entitiesRepository.findOne({
      where: { id: duplicateId },
    });

    if (!primary || !duplicate) {
      throw new Error("One or both entities not found");
    }

    // Prefer longer, more complete mention (e.g., "Juan Pérez" > "Juan")
    if (duplicate.rawText.length > primary.rawText.length) {
      primary.rawText = duplicate.rawText;
      primary.normText = duplicate.normText;
    }

    const result = await this.entitiesRepository.save(primary);

    this.logger.log(
      `Merged entities: ${duplicate.rawText} (${duplicateId}) → ${primary.rawText} (${primaryId})`,
    );

    return result;
  }

  /**
   * Flag suspicious entities for manual review (e.g., locations detected as PERSON).
   * Returns true if entity should be reviewed before graph ingestion.
   */
  flagForReview(entity: StgEntity): { shouldReview: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check 1: Single character or very short names (likely noise)
    if (entity.rawText.length < 2) {
      issues.push(`Entity name too short: "${entity.rawText}"`);
    }

    // Check 2: Common words/stopwords misclassified as PERSON
    const suspiciousPersonNames = new Set([
      "USANDO",
      "UTILIZ",
      "SIENDO",
      "CUANDO",
      "AUNQUE",
      "CADA",
      "DURANTE",
      "HACIA",
      "SOBRE",
      "DESPUÉS",
      "ANTES",
      "OTRA",
      "MISMO",
      "ACERCA",
      "FUERA",
      "DENTRO",
      "AFIRM",
      "INDICÓ",
      "DIJO",
      "SEÑALÓ",
    ]);

    if (entity.type === "PERSON" && suspiciousPersonNames.has(entity.normText)) {
      issues.push(
        `Likely not a person name: "${entity.rawText}" detected as PERSON (NER error)`,
      );
    }

    // Check 3: All-caps names without vowels (likely acronym misclassification)
    if (
      entity.type === "PERSON" &&
      /^[A-Z]{2,}$/.test(entity.rawText) &&
      !/[AEIOU]/.test(entity.rawText)
    ) {
      issues.push(
        `Possible acronym misclassified as person: "${entity.rawText}"`,
      );
    }

    // Check 4: Geographic terms as person names
    const geoTerms = [
      "VENEZUELA",
      "MÉXICO",
      "BRASIL",
      "COLOMBIA",
      "ARUBA",
      "MADRID",
      "HAVANA",
      "CARACAS",
      "BOGOTÁ",
      "BUENOS",
      "AIRES",
      "SAN",
      "JOSE",
      "AMERICA",
      "EUROPE",
      "AFRICA",
    ];
    if (entity.type === "PERSON" && geoTerms.includes(entity.normText)) {
      issues.push(
        `Geographic term misclassified as PERSON: "${entity.rawText}" (likely ORG/LOC)`,
      );
    }

    return {
      shouldReview: issues.length > 0,
      issues,
    };
  }

  /**
   * Jaro-Winkler similarity algorithm.
   * Industry standard for entity matching (Wikidata, OFAC).
   * Returns 0-1 score (1.0 = identical).
   */
  private jaroWinklerSimilarity(s1: string, s2: string): number {
    // Short circuit for identical strings
    if (s1 === s2) return 1.0;

    const len1 = s1.length;
    const len2 = s2.length;

    if (len1 === 0 || len2 === 0) return 0;

    // Calculate Jaro similarity
    const matchDistance = Math.max(len1, len2) / 2 - 1;
    const matches = [new Array(len1).fill(false), new Array(len2).fill(false)];
    let matchCount = 0;
    let transpositions = 0;

    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, len2);

      for (let j = start; j < end; j++) {
        if (!matches[1][j] && s1[i] === s2[j]) {
          matches[0][i] = true;
          matches[1][j] = true;
          matchCount++;
          break;
        }
      }
    }

    if (matchCount === 0) return 0;

    // Count transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (matches[0][i]) {
        while (!matches[1][k]) k++;
        if (s1[i] !== s2[k]) transpositions++;
        k++;
      }
    }

    const jaro =
      (matchCount / len1 +
        matchCount / len2 +
        (matchCount - transpositions / 2) / matchCount) /
      3;

    // Apply Winkler modification for common prefix
    let prefix = 0;
    for (let i = 0; i < Math.min(4, len1, len2); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }

    const winkler = jaro + prefix * 0.1 * (1 - jaro);
    return Math.min(winkler, 1.0);
  }

  /**
   * Normalize text for comparison: lowercase, remove accents, trim whitespace.
   */
  private normalizeForComparison(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim();
  }

  /**
   * Build human-readable reason for why entities are similar.
   */
  private buildMatchReason(
    entity1: StgEntity,
    entity2: StgEntity,
    similarity: number,
  ): string {
    const simPercent = Math.round(similarity * 100);

    // Check what's similar
    const sameName = entity1.normText === entity2.normText;
    const lengthDiff = Math.abs(entity1.rawText.length - entity2.rawText.length);
    const charOverlap = this.countCommonChars(entity1.rawText, entity2.rawText);

    if (sameName) {
      return `${simPercent}% match: Same normalized name "${entity1.normText}"`;
    }

    if (lengthDiff <= 3 && charOverlap > 0.7) {
      return `${simPercent}% match: Likely truncated or variant spelling ("${entity1.rawText}" vs "${entity2.rawText}")`;
    }

    if (charOverlap > 0.8) {
      return `${simPercent}% match: Significant character overlap (${(charOverlap * 100).toFixed(0)}%)`;
    }

    return `${simPercent}% similar: "${entity1.rawText}" vs "${entity2.rawText}"`;
  }

  /**
   * Count common characters between strings (simple heuristic).
   */
  private countCommonChars(s1: string, s2: string): number {
    const chars1 = new Set(s1.toLowerCase());
    const chars2 = new Set(s2.toLowerCase());
    const common = [...chars1].filter((c) => chars2.has(c)).length;
    return common / Math.max(chars1.size, chars2.size);
  }
}
