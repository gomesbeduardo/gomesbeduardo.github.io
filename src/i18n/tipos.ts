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

export interface CardProjeto {
  alt?: string;
  capaAria?: string;
  capaSub?: string;
  titulo: string;
  paragrafos: string[];
  figuras: { valor: string; rotulo: string }[];
  tags: string[];
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
  stack: {
    label: string;
    titulo: string;
    linhasAria: string;
    linhas: { aria: string; chips: string[]; extras: string[] }[];
    cabecalho: string[];
    tabelaAria: string;
    tabela: { tech: string; onde: string; como: string; tag: string }[];
  };
  projetos: SecaoTitulo & { cards: CardProjeto[] };
  numeros: SecaoTitulo & {
    aviso: string;
    coleta: string;
    janela: string;
    contribuicoes: string;
    repos: string;
    linguagens: string;
    calTitulo: string;
    calAria: string;
  };
  contato: SecaoTitulo & {
    local: string;
    emailAria: string;
    email: string;
    curriculo: string;
    curriculoArquivo: string;
  };
  rodape: {
    citacao: string;
    autorCitacao: string;
    claudeBtn: string;
    spec: string;
    navAria: string;
    navTitulo: string;
    sobreTitulo: string;
    sobreTexto: string;
    codigo: string;
    autor: string;
    topo: string;
  };
  modal: {
    fechar: string;
    titulo: string;
    intro: string;
    secoes: { titulo: string; texto: string }[];
    perfil: { titulo: string; texto: string; itens: string[] };
    link: string;
  };
}

export interface Dicionario {
  home: Home;
  projetos: Projetos;
}

export type IdProjeto = 'leadgate' | 'infohub' | 'lms';

// Texto de cada seção da página de projeto; a estrutura (tipo, link, ordem) fica em components/projeto/dados.ts.
export interface SecaoProjeto {
  titulo: string;
  paragrafos?: string[];
  codigo?: string;
  legenda?: string;
}

export interface PaginaProjeto {
  titulo: string;
  lede: string;
  capaAlt?: string;
  capaAria?: string;
  capaSub?: string;
  figuras: { valor: string; rotulo: string }[];
  secoes: SecaoProjeto[];
}

export interface Projetos {
  base: string;
  pular: string;
  voltar: string;
  voltarProjetos: string;
  tema: string;
  rodape: string;
  topo: string;
  paginas: Record<IdProjeto, PaginaProjeto>;
}
