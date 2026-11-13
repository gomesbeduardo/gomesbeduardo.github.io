// Ícones e logos iguais nos dois idiomas. O compilador do Astro 7 reescreve <use/> e <path/>
// autoclosed, então o SVG fica como string e sai com set:html.
export const icone = (id: string): string => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
export const logo = (id: string): string => `<svg class="logo" aria-hidden="true"><use href="#si-${id}"/></svg>`;
export const logoCapa = (id: string): string => `<svg viewBox="0 0 24 24"><use href="#si-${id}"/></svg>`;

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/eduardo-gomes-pb/',
  github: 'https://github.com/gomesbeduardo',
  repositorio: 'https://github.com/gomesbeduardo/gomesbeduardo.github.io',
};
