# Spec 007: correções do Code Race e do YourMentor

Estado: rascunho, aguardando aprovação do responsável.

## Pedido literal

> E correção, fui assistente financeiro no coderace, e não sou mais. Foi algo que aconteceu apenas durante o evento e organização, não fixo. E yourmentor surgiu da Mentor.Me campeã do Ideathon 25, apenas teve rebranding e mudou o foco.
>
> Organização (Financeiro) e Campeão no mesmo ano, fui comissão organizadora do de 2025, confundi os dois, tire o IX e use apenas a data.

## Problema

O site, o currículo e o README dizem três coisas erradas:

- O responsável aparece como assistente financeiro do Code Race 2026 "de mar/2026 até hoje", como função fixa. Ele só atuou durante a organização e o evento.
- A comissão organizadora de 2025 aparece como "IX Code Race". O número está errado; vale só o ano.
- O YourMentor aparece como fundado em jun/2026. Ele nasceu da Mentor.Me, campeã do 1º Ideathon de SI em out/2025, e em jun/2026 só mudou de nome e de foco.

## Fatos corrigidos (responsável, 11/11/2026)

- R1. Code Race 2025: comissão organizadora, 28 horas. Sem numeral romano.
- R2. Code Race 2026: assistente financeiro da organização, só durante a preparação e o evento. Sem "atual" e sem mês de início. Continua valendo a frase de que ele atuou só nas finanças, sem papel na avaliação das equipes, agora no passado.
- R3. Code Race 2026: campeão com o AgroPlanner (sem mudança; é o mesmo ano de R2).
- R4. YourMentor: cofundador desde out/2025. A Mentor.Me, equipe campeã do 1º Ideathon de SI da AMF (out/2025), virou YourMentor em jun/2026, com novo nome e novo foco.

## O que muda

| Onde | Antes | Depois (PT) | Depois (EN) |
|---|---|---|---|
| Voluntariado no `curriculo.json`, Experiência e Trajetória do site | "Assistente financeiro da organização do Code Race 2026", desde mar/2026, atual; "Atuo só nas finanças, sem papel na avaliação das equipes" | "Assistente financeiro da organização do Code Race 2026", quando "2026"; "Atuei só nas finanças, durante a organização e o evento, sem papel na avaliação das equipes." | "Financial assistant on the Code Race 2026 organizing team", "2026"; "I worked only on the finances, during the organization and the event, with no role in judging the teams." |
| Voluntariado e Trajetória | "Comissão organizadora do IX Code Race", 28 horas, 2025 | "Comissão organizadora do Code Race 2025", 28 horas, 2025 | "Code Race 2025 organizing committee", 28 hours, 2025 |
| Linha "Voluntariado" da Experiência (site) | "…; assistente financeiro da organização do Code Race 2026; comissão organizadora do IX Code Race (28 h) e da Semana Acadêmica de SI (40 h)." | "…; assistente financeiro da organização do Code Race 2026; comissão organizadora do Code Race 2025 (28 h) e da Semana Acadêmica de SI (40 h)." | o equivalente em EN |
| YourMentor no `curriculo.json` e no site (Trajetória, Experiência) | início jun/2026; "Cofundei o YourMentor em junho." | início out/2025; "Cofundei a Mentor.Me, campeã do 1º Ideathon de SI da AMF, que virou YourMentor em jun/2026, com novo nome e novo foco." seguido do texto atual sobre o back-end | "I co-founded Mentor.Me, winner of the 1st AMF IS Ideathon, which became YourMentor in Jun 2026, with a new name and a new focus." |
| Curiosidade c10 (`site/surpresas.js`) e destaque do verso da foto (spec 005) | "Sou cofundador do YourMentor desde junho de 2026." | "Sou cofundador do YourMentor desde outubro de 2025, quando ele ainda se chamava Mentor.Me." | "I have been a co-founder of YourMentor since October 2025, back when it was called Mentor.Me." |
| `README.md` e `PRODUCT.md` | "co-founder desde jun/2026" e o "IX", se aparecerem | mesmas correções | |
| PDFs em `site/curriculo/` | gerados do JSON antigo | gerados de novo a partir do JSON corrigido | |

A ordem da Trajetória segue as datas: o YourMentor passa para out/2025, junto do Ideathon.

## Critérios de aceite

- A1. Dado o `curriculo.json`, o site (PT e EN), o README e o `PRODUCT.md`, quando se procura "IX Code Race", "IX Code" ou "9th Code Race", então não há ocorrência (teste estático).
- A2. Dado o mesmo conjunto, então nenhum item de assistente financeiro do Code Race tem "atual", "present", "desde mar/2026" ou "since Mar" (teste estático).
- A3. Dado o `curriculo.json` e o site, então o YourMentor começa em out/2025 ("Oct/2025" no EN) e cita a Mentor.Me e o rebranding em jun/2026 (teste estático).
- A4. Dado `site/surpresas.js`, então a c10 tem o texto novo em PT e EN (teste estático).
- A5. Dado o gerador de PDF, então os PDFs novos passam nas verificações de privacidade, estilo e páginas que já existem (CI "Testes e PDFs" verde).
- A6. Dado o site em 390 e 1280 px, então a Trajetória mostra o YourMentor na posição de out/2025, e nada passa da largura da tela (Playwright).

## Fora do escopo

- Unificar a grafia "Coderace" e "Code Race" no site. Hoje as duas aparecem; esta spec não mexe nisso.
- O título do Coderace 2026 e o AgroPlanner, que continuam como estão.

## Perguntas abertas

- P1. A grafia oficial do evento é "Code Race" ou "Coderace"? Recomendação: decidir numa correção separada, porque muda vários textos.
