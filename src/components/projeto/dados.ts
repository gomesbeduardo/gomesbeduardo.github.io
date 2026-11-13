// Estrutura das páginas de projeto, igual nos dois idiomas. O texto vem do dicionário (projetos.paginas),
// na mesma ordem de `secoes`.
import type { IdProjeto } from '../../i18n/tipos';

export type Secao =
  | { tipo: 'texto'; ancora: string; href?: string }
  | { tipo: 'stack'; ancora: string }
  | { tipo: 'galeria'; ancora: string };

export interface Meta {
  capa: { img: string; largura: number; altura: number; recorte?: string; ar?: string } | { logos: string[] };
  tags: string[];
  secoes: Secao[];
}

export const PROJETOS: Record<IdProjeto, Meta> = {
  leadgate: {
    capa: { img: 'img/leadgate.png', largura: 1280, altura: 640 },
    tags: [],
    secoes: [{ tipo: 'texto', ancora: 'problema' }, { tipo: 'texto', ancora: 'feito' }, { tipo: 'texto', ancora: 'resultados', href: 'https://github.com/gomesbeduardo/leadgate' }],
  },
  infohub: {
    capa: { img: 'img/infohub.jpg', largura: 1568, altura: 734, recorte: 'crop-sb', ar: '--ar:1568/734' },
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    secoes: [{ tipo: 'texto', ancora: 'contexto' }, { tipo: 'texto', ancora: 'feito', href: 'https://github.com/gomesbeduardo/infohub-inovamf' }, { tipo: 'stack', ancora: 'stack' }, { tipo: 'galeria', ancora: 'galeria' }],
  },
  lms: {
    capa: { logos: ['nextdotjs', 'typescript', 'prisma', 'postgresql', 'docker'] },
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker'],
    secoes: [{ tipo: 'texto', ancora: 'contexto', href: 'https://github.com/gomesbeduardo/plataforma-LMS-corp' }, { tipo: 'stack', ancora: 'stack' }],
  },
};
