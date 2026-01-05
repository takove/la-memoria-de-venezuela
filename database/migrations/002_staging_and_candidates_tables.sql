-- Migration: 002_staging_and_candidates_tables
-- Description: Creates staging tables for investigative ingestion and candidate testaferros

-- Create enum types for staging
CREATE TYPE stg_entity_type AS ENUM ('PERSON', 'ORG', 'LOCATION');
CREATE TYPE stg_node_type AS ENUM ('person', 'org', 'article');
CREATE TYPE stg_edge_type AS ENUM ('mentioned_in', 'co_mentioned', 'relation_pattern', 'officer_of', 'beneficial_owner', 'leaked_officer_of', 'corp_tie');

-- Staging articles table
CREATE TABLE stg_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet VARCHAR(80) NOT NULL,
    title TEXT NOT NULL,
    url VARCHAR(512) NOT NULL UNIQUE,
    lang CHAR(2) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    raw_html TEXT,
    clean_text TEXT,
    content_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg_articles_published_at ON stg_articles(published_at DESC);
CREATE INDEX idx_stg_articles_outlet ON stg_articles(outlet);
CREATE INDEX idx_stg_articles_retrieved_at ON stg_articles(retrieved_at DESC);

-- Staging entities table
CREATE TABLE stg_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES stg_articles(id) ON DELETE CASCADE,
    type stg_entity_type NOT NULL,
    raw_text TEXT NOT NULL,
    norm_text VARCHAR(320) NOT NULL,
    offsets JSONB,
    lang CHAR(2) NOT NULL,
    model_version VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg_entities_article ON stg_entities(article_id);
CREATE INDEX idx_stg_entities_article_type_norm ON stg_entities(article_id, type, norm_text);

-- Staging relations table
CREATE TABLE stg_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES stg_articles(id) ON DELETE CASCADE,
    pattern VARCHAR(64) NOT NULL,
    sentence TEXT NOT NULL,
    subject_entity_id UUID REFERENCES stg_entities(id) ON DELETE SET NULL,
    object_entity_id UUID REFERENCES stg_entities(id) ON DELETE SET NULL,
    confidence NUMERIC(5, 3),
    model_version VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg_relations_article ON stg_relations(article_id);
CREATE INDEX idx_stg_relations_pattern ON stg_relations(pattern);

-- Staging nodes table (graph representation)
CREATE TABLE stg_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type stg_node_type NOT NULL,
    canonical_name VARCHAR(320) NOT NULL,
    alt_names JSONB,
    source_ids JSONB,
    tier1_id UUID REFERENCES officials(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg_nodes_type_name ON stg_nodes(type, canonical_name);
CREATE INDEX idx_stg_nodes_tier1 ON stg_nodes(tier1_id) WHERE tier1_id IS NOT NULL;

-- Staging edges table (graph relationships)
CREATE TABLE stg_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    src_node_id UUID NOT NULL REFERENCES stg_nodes(id) ON DELETE CASCADE,
    dst_node_id UUID NOT NULL REFERENCES stg_nodes(id) ON DELETE CASCADE,
    type stg_edge_type NOT NULL,
    weight NUMERIC(10, 4),
    evidence_ref JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg_edges_type_src_dst ON stg_edges(type, src_node_id, dst_node_id);
CREATE INDEX idx_stg_edges_src ON stg_edges(src_node_id);
CREATE INDEX idx_stg_edges_dst ON stg_edges(dst_node_id);

-- Staging scores table
CREATE TABLE stg_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_node_id UUID NOT NULL REFERENCES stg_nodes(id) ON DELETE CASCADE,
    tier1_id UUID REFERENCES officials(id) ON DELETE SET NULL,
    score NUMERIC(10, 4),
    confidence_level INT,
    components JSONB,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stg_scores_tier1_score ON stg_scores(tier1_id, score DESC) WHERE score IS NOT NULL;
CREATE INDEX idx_stg_scores_confidence ON stg_scores(confidence_level DESC) WHERE confidence_level IS NOT NULL;

-- Candidate testaferros table (promoted from staging)
CREATE TABLE candidate_testaferros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_node_id UUID REFERENCES stg_nodes(id) ON DELETE SET NULL,
    tier1_id UUID REFERENCES officials(id) ON DELETE SET NULL,
    normalized_name VARCHAR(320) NOT NULL,
    linked_org_ids JSONB,
    outlets JSONB,
    pattern_snippet TEXT,
    source_urls JSONB,
    published_at TIMESTAMP WITH TIME ZONE,
    recency_score NUMERIC(10, 4),
    composite_score NUMERIC(10, 4),
    confidence_level INT,
    evidence_edges JSONB,
    ingested_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_testaferros_tier1 ON candidate_testaferros(tier1_id);
CREATE INDEX idx_candidate_testaferros_confidence ON candidate_testaferros(confidence_level DESC);
CREATE INDEX idx_candidate_testaferros_ingested_at ON candidate_testaferros(ingested_at DESC);
