-- Seed data: Sample officials and sanctions
-- Source: Public OFAC data and DOJ indictments

-- Insert sample officials
INSERT INTO officials (id, first_name, last_name, full_name, status, biography_es) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'Nicolás',
    'Maduro Moros',
    'Nicolás Maduro Moros',
    'active',
    'Presidente de Venezuela desde 2013. Anteriormente sirvió como Ministro de Relaciones Exteriores (2006-2012) y Vicepresidente (2012-2013) bajo Hugo Chávez.'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Diosdado',
    'Cabello Rondón',
    'Diosdado Cabello Rondón',
    'active',
    'Presidente de la Asamblea Nacional Constituyente. Diputado y líder del Partido Socialista Unido de Venezuela (PSUV).'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Tareck',
    'El Aissami',
    'Tareck Zaidan El Aissami Maddah',
    'imprisoned',
    'Ex Vicepresidente Ejecutivo de Venezuela (2017-2018), Ex Ministro de Petróleo. Acusado de narcotráfico por Estados Unidos.'
),
(
    'a4444444-4444-4444-4444-444444444444',
    'Vladimir',
    'Padrino López',
    'Vladimir Padrino López',
    'active',
    'Ministro de la Defensa de Venezuela desde 2014. General en Jefe del Ejército Bolivariano.'
),
(
    'a5555555-5555-5555-5555-555555555555',
    'Delcy',
    'Rodríguez Gómez',
    'Delcy Eloína Rodríguez Gómez',
    'active',
    'Vicepresidenta Ejecutiva de Venezuela desde 2018. Anteriormente Ministra de Relaciones Exteriores y Presidenta de la Asamblea Nacional Constituyente.'
),
(
    'a6666666-6666-6666-6666-666666666666',
    'Jorge',
    'Rodríguez Gómez',
    'Jorge Jesús Rodríguez Gómez',
    'active',
    'Presidente de la Asamblea Nacional de Venezuela. Anteriormente Ministro de Comunicación e Información.'
);

-- Insert sample positions
INSERT INTO positions (official_id, title, title_es, organization, branch, start_date, is_current) VALUES
('a1111111-1111-1111-1111-111111111111', 'President of Venezuela', 'Presidente de Venezuela', 'Gobierno de Venezuela', 'executive', '2013-04-19', true),
('a2222222-2222-2222-2222-222222222222', 'President of the Constituent Assembly', 'Presidente de la Asamblea Nacional Constituyente', 'Asamblea Nacional Constituyente', 'legislative', '2017-08-04', true),
('a3333333-3333-3333-3333-333333333333', 'Executive Vice President', 'Vicepresidente Ejecutivo', 'Gobierno de Venezuela', 'executive', '2017-01-04', false),
('a4444444-4444-4444-4444-444444444444', 'Minister of Defense', 'Ministro de la Defensa', 'Ministerio de la Defensa', 'military', '2014-10-28', true),
('a5555555-5555-5555-5555-555555555555', 'Executive Vice President', 'Vicepresidenta Ejecutiva', 'Gobierno de Venezuela', 'executive', '2018-06-14', true),
('a6666666-6666-6666-6666-666666666666', 'President of National Assembly', 'Presidente de la Asamblea Nacional', 'Asamblea Nacional', 'legislative', '2021-01-05', true);

-- Insert sample sanctions (OFAC)
INSERT INTO sanctions (official_id, type, program_code, program_name, reason, reason_es, imposed_date, status, source_url) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'ofac_sdn',
    'VENEZUELA-EO13692',
    'Venezuela-related Sanctions',
    'Designated for being responsible for or complicit in actions or policies that undermine democratic processes or institutions in Venezuela',
    'Designado por ser responsable o cómplice de acciones o políticas que socavan los procesos o instituciones democráticas en Venezuela',
    '2017-07-31',
    'active',
    'https://home.treasury.gov/news/press-releases'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'ofac_sdn',
    'VENEZUELA-EO13692',
    'Venezuela-related Sanctions',
    'Designated for involvement in significant acts of corruption and being responsible for undermining democratic processes',
    'Designado por participación en actos significativos de corrupción y ser responsable de socavar los procesos democráticos',
    '2017-05-18',
    'active',
    'https://home.treasury.gov/news/press-releases'
),
(
    'a3333333-3333-3333-3333-333333333333',
    'ofac_sdn',
    'SDNTK',
    'Foreign Narcotics Kingpin Sanctions',
    'Designated as a Specially Designated Narcotics Trafficker for playing a significant role in international narcotics trafficking',
    'Designado como Narcotraficante Especialmente Designado por desempeñar un papel significativo en el narcotráfico internacional',
    '2017-02-13',
    'active',
    'https://home.treasury.gov/news/press-releases'
),
(
    'a4444444-4444-4444-4444-444444444444',
    'ofac_sdn',
    'VENEZUELA-EO13692',
    'Venezuela-related Sanctions',
    'Designated for actions undermining democracy in Venezuela and involvement in human rights abuses',
    'Designado por acciones que socavan la democracia en Venezuela y participación en abusos de derechos humanos',
    '2018-05-18',
    'active',
    'https://home.treasury.gov/news/press-releases'
),
(
    'a5555555-5555-5555-5555-555555555555',
    'ofac_sdn',
    'VENEZUELA-EO13692',
    'Venezuela-related Sanctions',
    'Designated for involvement in electoral fraud and being responsible for actions undermining democratic institutions',
    'Designada por participación en fraude electoral y ser responsable de acciones que socavan las instituciones democráticas',
    '2018-01-05',
    'active',
    'https://home.treasury.gov/news/press-releases'
);

-- Insert sample case (Maduro Indictment)
INSERT INTO cases (id, case_number, title, title_es, type, jurisdiction, court, description, description_es, charges, charges_es, filing_date, status, source_url) VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    '1:20-cr-00116-AJN',
    'United States v. Nicolás Maduro Moros et al.',
    'Estados Unidos vs. Nicolás Maduro Moros y otros',
    'indictment',
    'usa',
    'United States District Court, Southern District of New York',
    'Federal indictment charging Maduro and other Venezuelan officials with narco-terrorism conspiracy, cocaine importation, and other drug trafficking crimes.',
    'Acusación federal que imputa a Maduro y otros funcionarios venezolanos conspiración de narco-terrorismo, importación de cocaína y otros delitos de narcotráfico.',
    ARRAY['Conspiracy to commit narco-terrorism', 'Conspiracy to import cocaine', 'Conspiracy to use weapons'],
    ARRAY['Conspiración para cometer narco-terrorismo', 'Conspiración para importar cocaína', 'Conspiración para usar armas'],
    '2020-03-26',
    'open',
    'https://www.justice.gov/opa/pr/nicolas-maduro-moros-and-14-current-and-former-venezuelan-officials-charged-narco-terrorism'
);

-- Link officials to the case
INSERT INTO case_involvements (official_id, case_id, role, details_es) VALUES
('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'defendant', 'Principal acusado en la acusación por narco-terrorismo'),
('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'defendant', 'Co-acusado en la conspiración de narcotráfico'),
('a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'defendant', 'Co-acusado, recompensa de $10 millones por información');

-- Add some EU sanctions as well
INSERT INTO sanctions (official_id, type, program_code, program_name, reason_es, imposed_date, status) VALUES
('a1111111-1111-1111-1111-111111111111', 'eu', 'VENEZUELA', 'EU Venezuela Sanctions', 'Sanciones de la Unión Europea por violaciones de derechos humanos y socavamiento de la democracia', '2018-01-22', 'active'),
('a2222222-2222-2222-2222-222222222222', 'eu', 'VENEZUELA', 'EU Venezuela Sanctions', 'Sanciones de la Unión Europea por violaciones de derechos humanos', '2018-01-22', 'active'),
('a5555555-5555-5555-5555-555555555555', 'eu', 'VENEZUELA', 'EU Venezuela Sanctions', 'Sanciones de la Unión Europea por acciones contra la democracia', '2018-06-25', 'active');
