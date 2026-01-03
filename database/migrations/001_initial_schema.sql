-- Migration: 001_initial_schema
-- Description: Creates the initial database schema for La Memoria de Venezuela

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE official_status AS ENUM ('active', 'inactive', 'deceased', 'exiled', 'imprisoned');
CREATE TYPE sanction_type AS ENUM ('ofac_sdn', 'ofac_ns_plc', 'eu', 'canada', 'uk', 'other');
CREATE TYPE sanction_status AS ENUM ('active', 'lifted', 'modified');
CREATE TYPE case_type AS ENUM ('indictment', 'criminal', 'civil', 'iachr', 'icc', 'other');
CREATE TYPE case_status AS ENUM ('open', 'closed', 'pending', 'dismissed', 'conviction', 'acquittal');
CREATE TYPE jurisdiction AS ENUM ('usa', 'venezuela', 'spain', 'colombia', 'iachr', 'icc', 'other');
CREATE TYPE involvement_role AS ENUM ('defendant', 'witness', 'accused', 'convicted', 'mentioned');
CREATE TYPE position_branch AS ENUM ('executive', 'legislative', 'judicial', 'military', 'intelligence', 'state_enterprise', 'other');

-- Officials table
CREATE TABLE officials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(250) NOT NULL,
    aliases TEXT[],
    birth_date DATE,
    birth_place VARCHAR(200),
    nationality VARCHAR(100),
    cedula VARCHAR(20) UNIQUE,
    passport_number VARCHAR(50),
    status official_status DEFAULT 'active',
    photo_url VARCHAR(500),
    biography TEXT,
    biography_es TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for officials
CREATE INDEX idx_officials_name ON officials(last_name, first_name);
CREATE INDEX idx_officials_status ON officials(status);
CREATE INDEX idx_officials_full_name_search ON officials USING gin(to_tsvector('spanish', full_name));

-- Positions table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    title_es VARCHAR(200),
    organization VARCHAR(200),
    organization_es VARCHAR(200),
    branch position_branch DEFAULT 'executive',
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    source_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_positions_official ON positions(official_id);
CREATE INDEX idx_positions_branch ON positions(branch);
CREATE INDEX idx_positions_dates ON positions(start_date, end_date);

-- Sanctions table
CREATE TABLE sanctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    type sanction_type DEFAULT 'ofac_sdn',
    program_code VARCHAR(50) NOT NULL,
    program_name VARCHAR(200) NOT NULL,
    ofac_id VARCHAR(50),
    reason TEXT,
    reason_es TEXT,
    imposed_date DATE NOT NULL,
    lifted_date DATE,
    status sanction_status DEFAULT 'active',
    source_url VARCHAR(500),
    treasury_press_release VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sanctions_official ON sanctions(official_id);
CREATE INDEX idx_sanctions_type_status ON sanctions(type, status);
CREATE INDEX idx_sanctions_date ON sanctions(imposed_date);

-- Cases table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(300) NOT NULL,
    title_es VARCHAR(300),
    type case_type DEFAULT 'criminal',
    jurisdiction jurisdiction DEFAULT 'usa',
    court VARCHAR(200),
    description TEXT,
    description_es TEXT,
    charges TEXT[],
    charges_es TEXT[],
    filing_date DATE,
    resolution_date DATE,
    status case_status DEFAULT 'open',
    document_url VARCHAR(500),
    source_url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_type_status ON cases(type, status);
CREATE INDEX idx_cases_date ON cases(filing_date);
CREATE INDEX idx_cases_jurisdiction ON cases(jurisdiction);

-- Case involvements table (junction table)
CREATE TABLE case_involvements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    role involvement_role DEFAULT 'defendant',
    details TEXT,
    details_es TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(official_id, case_id)
);

CREATE INDEX idx_involvements_official ON case_involvements(official_id);
CREATE INDEX idx_involvements_case ON case_involvements(case_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_officials_updated_at
    BEFORE UPDATE ON officials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sanctions_updated_at
    BEFORE UPDATE ON sanctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_officials(search_query TEXT)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR(250),
    status official_status,
    photo_url VARCHAR(500),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.full_name,
        o.status,
        o.photo_url,
        ts_rank(to_tsvector('spanish', o.full_name || ' ' || COALESCE(o.biography_es, '')), plainto_tsquery('spanish', search_query)) as rank
    FROM officials o
    WHERE 
        to_tsvector('spanish', o.full_name || ' ' || COALESCE(o.biography_es, '')) @@ plainto_tsquery('spanish', search_query)
        OR o.full_name ILIKE '%' || search_query || '%'
        OR search_query = ANY(o.aliases)
    ORDER BY rank DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE officials IS 'Venezuelan government officials under international scrutiny';
COMMENT ON TABLE sanctions IS 'International sanctions imposed on officials';
COMMENT ON TABLE cases IS 'Legal cases and proceedings against officials';
COMMENT ON TABLE positions IS 'Government positions held by officials';
COMMENT ON TABLE case_involvements IS 'Links between officials and legal cases';
