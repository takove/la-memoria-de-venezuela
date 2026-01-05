/**
 * Fuzzy Matching Service for Tier 1 Officials
 *
 * Uses fuzzball (fuzzywuzzy port) to match NER-extracted entities against
 * verified Tier 1 sanctions lists.
 *
 * Scoring:
 * - >95: Confidence 5 (OFFICIAL) - Auto-approve
 * - 85-95: Confidence 4 (VERIFIED) - Auto-approve with LLM confirmation
 * - <85: Flag for LLM/human review
 *
 * Spanish name handling:
 * - Strip accents (José → Jose)
 * - Expand nicknames (Nicolás → Nicolas, Nico)
 * - Normalize capitalization
 */

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tier1Official } from "../../../entities/tier1-official.entity";
import * as fuzzball from "fuzzball";

export interface Tier1Match {
  official: Tier1Official;
  score: number; // 0-100
  matchType: "exact" | "alias" | "fuzzy";
  matchedOn: string; // Which name/alias matched
}

@Injectable()
export class Tier1MatchService {
  private readonly logger = new Logger(Tier1MatchService.name);

  // Minimum score for fuzzy match consideration
  private readonly FUZZY_THRESHOLD = 85;

  // High confidence threshold (auto-approve)
  private readonly HIGH_CONFIDENCE_THRESHOLD = 95;

  // Spanish nickname/alias mappings
  private readonly SPANISH_NICKNAMES: Record<string, string[]> = {
    Nicolás: ["Nicolas", "Nico"],
    José: ["Jose", "Pepe"],
    María: ["Maria"],
    Jesús: ["Jesus", "Chucho"],
    Francisco: ["Pancho", "Paco"],
    Alejandro: ["Alex"],
    Antonio: ["Tony"],
    Carlos: ["Charlie"],
    Luis: ["Lucho"],
    Rafael: ["Rafa"],
    Miguel: ["Mike"],
  };

  constructor(
    @InjectRepository(Tier1Official)
    private tier1Repository: Repository<Tier1Official>,
  ) {}

  /**
   * Match entity against Tier 1 officials using fuzzy matching
   *
   * @param entityName - Name extracted by NER
   * @param entityType - PERSON or ORGANIZATION
   * @returns Best match if score > threshold, else null
   */
  async matchTier1(
    entityName: string,
    entityType: "PERSON" | "ORGANIZATION",
  ): Promise<Tier1Match | null> {
    const normalized = this.normalizeSpanish(entityName);

    // Get all Tier 1 officials of matching type
    const officials = await this.tier1Repository.find({
      where: { entityType },
    });

    if (officials.length === 0) {
      this.logger.warn(`No Tier 1 officials found for type: ${entityType}`);
      return null;
    }

    let bestMatch: Tier1Match | null = null;
    let bestScore = 0;

    for (const official of officials) {
      // Check exact match on full name
      if (
        this.normalizeSpanish(official.fullName).toLowerCase() ===
        normalized.toLowerCase()
      ) {
        return {
          official,
          score: 100,
          matchType: "exact",
          matchedOn: official.fullName,
        };
      }

      // Check exact match on aliases
      for (const alias of official.aliases || []) {
        if (
          this.normalizeSpanish(alias).toLowerCase() ===
          normalized.toLowerCase()
        ) {
          return {
            official,
            score: 100,
            matchType: "alias",
            matchedOn: alias,
          };
        }
      }

      // Fuzzy match on full name
      const nameScore = fuzzball.token_sort_ratio(
        normalized,
        this.normalizeSpanish(official.fullName),
      );

      if (nameScore > bestScore) {
        bestScore = nameScore;
        bestMatch = {
          official,
          score: nameScore,
          matchType: "fuzzy",
          matchedOn: official.fullName,
        };
      }

      // Fuzzy match on aliases
      for (const alias of official.aliases || []) {
        const aliasScore = fuzzball.token_sort_ratio(
          normalized,
          this.normalizeSpanish(alias),
        );

        if (aliasScore > bestScore) {
          bestScore = aliasScore;
          bestMatch = {
            official,
            score: aliasScore,
            matchType: "fuzzy",
            matchedOn: alias,
          };
        }
      }
    }

    // Return match only if above threshold
    if (bestMatch && bestMatch.score >= this.FUZZY_THRESHOLD) {
      this.logger.log(
        `Match found: "${entityName}" → "${bestMatch.matchedOn}" (${bestMatch.score}%)`,
      );
      return bestMatch;
    }

    this.logger.debug(
      `No match found for "${entityName}" (best score: ${bestScore})`,
    );
    return null;
  }

  /**
   * Normalize Spanish text for matching:
   * - Remove accents (José → Jose)
   * - Lowercase
   * - Trim whitespace
   */
  private normalizeSpanish(text: string): string {
    return text
      .normalize("NFD") // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
      .trim();
  }

  /**
   * Expand name with Spanish nicknames
   * Example: "Nicolás Maduro" → ["Nicolas Maduro", "Nico Maduro"]
   */
  private expandNicknames(name: string): string[] {
    const parts = name.split(" ");
    const variants: string[] = [name];

    parts.forEach((part, index) => {
      const nicknames = this.SPANISH_NICKNAMES[part];
      if (nicknames) {
        nicknames.forEach((nickname) => {
          const variant = [...parts];
          variant[index] = nickname;
          variants.push(variant.join(" "));
        });
      }
    });

    return variants;
  }

  /**
   * Calculate confidence level (1-5) based on match score
   */
  getConfidenceLevel(matchScore: number): number {
    if (matchScore >= 95) return 5; // OFFICIAL
    if (matchScore >= 85) return 4; // VERIFIED
    if (matchScore >= 75) return 3; // CREDIBLE
    if (matchScore >= 65) return 2; // UNVERIFIED
    return 1; // RUMOR
  }

  /**
   * Check if match is high confidence (auto-approve threshold)
   */
  isHighConfidenceMatch(matchScore: number): boolean {
    return matchScore >= this.HIGH_CONFIDENCE_THRESHOLD;
  }
}
