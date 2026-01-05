/**
 * Sample data for Tier 2 testaferros testing.
 * Real Venezuelan news scenarios about straw men and regime fronts.
 */

export const SAMPLE_ARTICLES = [
  {
    outlet: "Reuters Venezuela",
    title: "Shell Company Linked to Maduro Official Under Sanctions",
    url: "https://example.com/shell-company-1?v=20260104-1",
    lang: "es",
    publishedAt: new Date("2023-06-15"),
    cleanText: `
      Juan Carlos Hidalgo, testaferro conocido del régimen, fue identificado 
      como titular de Petro Energy Holdings Ltd., empresa registrada en Panamá 
      con conexiones a Nicolás Maduro. Según documentos obtenidos por Reuters, 
      Hidalgo es el accionista nominal mientras que Diosdado Cabello controla 
      operativamente la empresa. La transacción ocurrió después de que Maduro 
      visitara Panamá en marzo de 2023.
    `,
  },
  {
    outlet: "El Nacional Investigaciones",
    title: "Red de Testaferros en Sector Minero Identificada",
    url: "https://example.com/mining-network?v=20260104-2",
    lang: "es",
    publishedAt: new Date("2023-07-20"),
    cleanText: `
      Una red de al menos 15 testaferros fue identificada operando en el sector 
      minero venezolano bajo el control de Jorge Roríguez. Incluye a personas 
      como María González Hernández, José Luis Martínez, y Carlos Alberto Pérez,
      quienes figuran como directores de empresas mineras que explotan oro y 
      coltán. Los beneficiarios reales son oficiales militares cercanos a Nicolás Maduro,
      incluido el General Padrino López.
    `,
  },
  {
    outlet: "Miami Herald en Español",
    title: "Empresario Español Acusado de Ser Testaferro de Cabello",
    url: "https://example.com/spanish-businessman?v=20260104-3",
    lang: "es",
    publishedAt: new Date("2023-08-10"),
    cleanText: `
      Fernando Díaz García, empresario español residente en Madrid, es acusado 
      de ser testaferro del ex vicepresidente Diosdado Cabello. La fiscalía 
      española alega que Díaz fue utilizado para canalizar fondos robados de 
      PDVSA a través de empresas de consultoría fantasma. El caso incluye 
      al contador Francisco Rodríguez y al abogado Jorge Martínez como cómplices.
    `,
  },
  {
    outlet: "Panorama Investigativo",
    title: "Testaferros del Clan Maduro en Sector Agroindustrial",
    url: "https://example.com/agro-sector?v=20260104-4",
    lang: "es",
    publishedAt: new Date("2023-09-05"),
    cleanText: `
      Investigadores encontraron que Alicia López de Maduro es titular nominal
      de tres empresas agroindustriales que operan en Cojedes. Su hermano, 
      Nicolás Maduro Jr., controla operativamente dos de ellas. El director 
      ejecutivo de facto es Roberto Alcalá, oficial de inteligencia. Las empresas 
      reciben subsidios gubernamentales mientras que las ganancias se transfieren 
      a cuentas en el exterior a través de Luxemburgo.
    `,
  },
  {
    outlet: "Tal Cual Digital",
    title: "Funcionaria Chavista Opera Red de Testaferros en Comercio Exterior",
    url: "https://example.com/customs-network?v=20260104-5",
    lang: "es",
    publishedAt: new Date("2023-10-12"),
    cleanText: `
      Margarita Rodríguez, directora de aduanas, es la cerebro detrás de una 
      red de testaferros en el sector de comercio exterior. Utilizó a Diana 
      Ríos y a su esposo Santiago Gómez para operar empresas importadoras que 
      contrabandean mercancía subsidiada. El abogado Rafael Torres facilita 
      la documentación falsa. El esquema ha generado pérdidas estimadas en 
      más de $200 millones anuales a la hacienda pública.
    `,
  },
  {
    outlet: "Runrunes",
    title: "General Padrino Usa a Tres Testaferros para Control de Gasolina",
    url: "https://example.com/fuel-scheme?v=20260104-6",
    lang: "es",
    publishedAt: new Date("2023-11-08"),
    cleanText: `
      El General Vladimir Padrino López utilizó a los testaferros Gustavo Morales,
      Héctor Flores, y Alejandra Castro para dirigir empresas de distribución de 
      gasolina. Aunque nominalmente son los dueños, Padrino controla cada operación 
      a través del coronel Sergio Mendoza. El esquema incluye la malversación de 
      $50 millones mensuales en combustible subsidiado que es vendido ilegalmente
      en Colombia.
    `,
  },
  {
    outlet: "Armando.info",
    title: "Red Internacional de Testaferros Descubierta",
    url: "https://example.com/international-front?v=20260104-7",
    lang: "es",
    publishedAt: new Date("2023-12-01"),
    cleanText: `
      Una red internacional de testaferros fue descubierta operando entre 
      Venezuela, México y Brasil. Los testaferros incluyen a Manuel Soto en 
      México, Fernando Costa en Brasil, y Leonidas Betancourt en Aruba. 
      Cada uno opera empresas de logística que supuestamente transportan 
      mercancía legal pero que en realidad mueve oro ilícito y diamantes 
      extraídos del territorio en manos de narcotraficantes y militares.
    `,
  },
  {
    outlet: "Crónica Uno",
    title: "Empresaria Usa Testaferro para Industria Farmacéutica Falsa",
    url: "https://example.com/pharma-fraud?v=20260104-8",
    lang: "es",
    publishedAt: new Date("2024-01-15"),
    cleanText: `
      Adriana Chirino, empresaria vinculada al gobierno, usa al testaferro 
      Miguel Aranda para operar una red de farmacias falsas. Aranda figura como 
      dueño de SupraPharm, empresa que distribuye medicinas adulteradas en 
      hospitales públicos. El director real es el médico Oscar Jiménez, quien
      también supervisa al contador Raúl Flores que blanquea los fondos.
    `,
  },
];

export interface SampleArticleDto {
  outlet: string;
  title: string;
  url: string;
  lang: string;
  publishedAt: Date;
  cleanText: string;
}
