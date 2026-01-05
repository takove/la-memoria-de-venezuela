import { Injectable, Logger } from "@nestjs/common";

/**
 * Pattern-based NER service for Spanish text.
 * Implements lightweight entity and relationship extraction using regex patterns.
 *
 * IMPORTANT: This is a production-ready but simple pattern-based implementation.
 * For enhanced accuracy, integrate with SpaCy (Spanish model) or Hugging Face transformers.
 */
@Injectable()
export class WinkNerService {
  private readonly logger = new Logger(WinkNerService.name);

  constructor() {
    this.logger.log("Pattern-based NER service initialized");
  }

  /**
   * Extract named entities from Spanish text using pattern matching.
   * Returns array of entities with normalized names.
   */
  async extractEntities(text: string): Promise<
    Array<{
      rawText: string;
      normText: string;
      type: "PERSON" | "ORG" | "LOCATION";
      confidence: number;
      offsets?: Record<string, any>;
    }>
  > {
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      const entities: Array<{
        rawText: string;
        normText: string;
        type: "PERSON" | "ORG" | "LOCATION";
        confidence: number;
        offsets?: Record<string, any>;
      }> = [];

      // Pattern 1: Capitalized proper nouns (persons, organizations)
      const properNounPattern =
        /\b([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)*)\b/g;
      let match;

      const seen = new Set<string>();
      while ((match = properNounPattern.exec(text)) !== null) {
        const rawText = match[1];
        if (seen.has(rawText.toUpperCase()) || rawText.length < 3) continue;
        seen.add(rawText.toUpperCase());

        const normText = this.normalizeText(rawText);

        // Simple heuristic: single capital word = likely person, multiple = likely org
        const type = rawText.split(" ").length > 1 ? "ORG" : "PERSON";

        entities.push({
          rawText,
          normText,
          type,
          confidence: 0.65, // Lower confidence for pattern-based matching
          offsets: {
            start: match.index,
            end: match.index + rawText.length,
          },
        });
      }

      // Pattern 2: Organization suffixes (Ltd., S.A., Corp., etc.)
      const orgPattern =
        /\b([A-Za-z0-9\s]+)(?:Ltd\.?|S\.A\.?|Corp\.?|Inc\.?|LLC|SA|SPA)\b/gi;
      while ((match = orgPattern.exec(text)) !== null) {
        const rawText = match[0];
        const normText = this.normalizeText(rawText);

        if (!seen.has(normText)) {
          entities.push({
            rawText,
            normText,
            type: "ORG",
            confidence: 0.8,
            offsets: {
              start: match.index,
              end: match.index + rawText.length,
            },
          });
          seen.add(normText);
        }
      }

      // Pattern 3: Location indicators (de [Country], en [City])
      const locationPattern =
        /\b(?:de|en|desde|hacia)\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)*)\b/gi;
      while ((match = locationPattern.exec(text)) !== null) {
        const rawText = match[1];
        const normText = this.normalizeText(rawText);

        if (!seen.has(normText) && this.isLikelyLocation(rawText)) {
          entities.push({
            rawText,
            normText,
            type: "LOCATION",
            confidence: 0.7,
            offsets: {
              start: match.index + match[0].indexOf(rawText),
              end: match.index + match[0].indexOf(rawText) + rawText.length,
            },
          });
          seen.add(normText);
        }
      }

      this.logger.debug(
        `Extracted ${entities.length} entities from ${text.length} chars using pattern matching`,
      );
      return entities;
    } catch (error) {
      this.logger.error(
        `Error extracting entities: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Extract relationships between entities in text.
   * Uses pattern matching on verb phrases and keywords.
   */
  async extractRelations(text: string): Promise<
    Array<{
      pattern: string;
      sentence: string;
      subjectText?: string;
      objectText?: string;
      confidence: number;
    }>
  > {
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      const relations: Array<{
        pattern: string;
        sentence: string;
        subjectText?: string;
        objectText?: string;
        confidence: number;
      }> = [];

      // Split into sentences
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

      for (const sentence of sentences) {
        const sentenceText = sentence.trim();

        // Pattern 1: Testaferro pattern - "X es testaferro de Y"
        const testaferroMatch = sentenceText.match(
          /([A-Z][a-záéíóúñ\s]+)\s+(?:es|son)\s+testaferro(?:s)?\s+(?:de|del)\s+([A-Z][a-záéíóúñ\s]+)/i,
        );
        if (testaferroMatch) {
          relations.push({
            pattern: "testaferro_de",
            sentence: sentenceText,
            subjectText: testaferroMatch[1]?.trim(),
            objectText: testaferroMatch[2]?.trim(),
            confidence: 0.85,
          });
        }

        // Pattern 2: Officer pattern - "X is/was officer/director of Y"
        const officerMatch = sentenceText.match(
          /([A-Z][a-záéíóúñ\s]+)\s+(?:es|fue|es la|fue la)\s+(?:oficial|director|tesorero|secretario|administrador)\s+(?:de|del|de la)\s+([A-Z][a-záéíóúñ\s]+)/i,
        );
        if (officerMatch) {
          relations.push({
            pattern: "officer_of",
            sentence: sentenceText,
            subjectText: officerMatch[1]?.trim(),
            objectText: officerMatch[2]?.trim(),
            confidence: 0.8,
          });
        }

        // Pattern 3: Beneficial owner - "X is propietario/dueño of Y"
        const ownerMatch = sentenceText.match(
          /([A-Z][a-záéíóúñ\s]+)\s+(?:es|fue)\s+(?:propietario|dueño|accionista)\s+(?:de|del)\s+([A-Z][a-záéíóúñ\s]+)/i,
        );
        if (ownerMatch) {
          relations.push({
            pattern: "beneficial_owner",
            sentence: sentenceText,
            subjectText: ownerMatch[1]?.trim(),
            objectText: ownerMatch[2]?.trim(),
            confidence: 0.8,
          });
        }

        // Pattern 4: Co-mention pattern - "X and Y"
        const coMentionMatch = sentenceText.match(
          /([A-Z][a-záéíóúñ\s]+)\s+(?:y|e)\s+([A-Z][a-záéíóúñ\s]+)/,
        );
        if (
          coMentionMatch &&
          !testaferroMatch &&
          !officerMatch &&
          !ownerMatch
        ) {
          relations.push({
            pattern: "co_mentioned",
            sentence: sentenceText,
            subjectText: coMentionMatch[1]?.trim(),
            objectText: coMentionMatch[2]?.trim(),
            confidence: 0.6,
          });
        }
      }

      this.logger.debug(
        `Extracted ${relations.length} relations from ${sentences.length} sentences`,
      );
      return relations;
    } catch (error) {
      this.logger.error(
        `Error extracting relations: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Check if a string is likely a location (simple heuristic).
   */
  private isLikelyLocation(text: string): boolean {
    const commonLocations = [
      "venezuela",
      "colombia",
      "brasil",
      "eeuu",
      "estados unidos",
      "panama",
      "mexico",
      "miami",
      "caracas",
      "bogota",
      "madrid",
      "nueva york",
      "washington",
      "beijing",
      "moscow",
    ];
    const normalized = text.toLowerCase();
    return commonLocations.some((loc) => normalized.includes(loc));
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
