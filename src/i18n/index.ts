import { pt } from './pt';
import { en } from './en';
import type { Dicionario, Lang } from './tipos';

const dicionarios: Record<Lang, Dicionario> = { pt, en };

export const dicionario = (lang: Lang): Dicionario => dicionarios[lang];
