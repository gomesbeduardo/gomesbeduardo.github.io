export type Lang = 'pt' | 'en';

export interface Link {
  href: string;
  label: string;
}

export interface Idioma {
  href: string;
  current: boolean;
  lang: string;
  code: string;
  aria?: string;
}

export interface SecaoTitulo {
  label: string;
  titulo: string;
}

export interface ItemTrajetoria {
  quando: string;
  titulo: string;
  papel: string;
  paragrafos: string[];
}

export interface ItemExperiencia {
  quando: string;
  titulo: string;
  papel: string;
  texto?: string;
}

// Textos com entidade ou tag inline ficam como HTML e saem com set:html.
export interface Home {
  base: string;
  navLabel: string;
  links: Link[];
  idiomas: Idioma[];
  temaLabel: string;
  menuLabel: string;
  hero: {
    fotoAria: string;
    fotoSrc: string;
    srTitulo: string;
    fantasmas: string[];
    digitando: string;
    verProjetos: string;
    curriculoHref: string;
    curriculoTexto: string;
    fatos: string[];
  };
  sobre: SecaoTitulo & {
    lit: string;
    paragrafos: string[];
    passosAria: string;
    passos: { titulo: string; texto: string }[];
  };
  trajetoria: SecaoTitulo & { itens: ItemTrajetoria[]; curiosidade: string };
  experiencia: SecaoTitulo & { itens: ItemExperiencia[] };
}

export interface Dicionario {
  home: Home;
}
