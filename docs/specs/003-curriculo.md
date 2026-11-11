# 003. Currículo em PDF, PT e EN

**Status:** rascunho (textos provisórios até o responsável aprovar)
**Pedido (literal, do responsável):** "Currículo: PDF novo, geral, em PT e EN, gerado a partir dos textos aprovados. O currículo existente, guardado fora do repositório, foi feito para uma vaga e serve só de fonte."
**Decisões ligadas:** spec 001 (portfólio, que põe o botão "Currículo" apontando para os PDFs desta spec); spec 002 (workflow `publicar.yml`, que gera os PDFs no build).

## Problema

O único currículo existente foi escrito para uma vaga específica e traz telefone, cidade e disponibilidade de mudança. O site público precisa de um currículo geral, em português e inglês, com o mesmo conteúdo nas duas línguas, que um recrutador baixe e um sistema de triagem (ATS) consiga ler como texto. O repositório é público: o conteúdo só pode trazer nome, "Brasil", e-mail, LinkedIn, GitHub e o endereço do site.

Quem usa: o visitante baixa o PDF; o responsável edita um arquivo só e os dois PDFs saem dele; o front end (spec 001) linka os arquivos.

## Fatos confirmados

- F1. Nome: Eduardo Bergoli Gomes. E-mail `eduardobgomes100@gmail.com`, LinkedIn `linkedin.com/in/eduardo-gomes-pb`, GitHub `github.com/gomesbeduardo`, site `gomesbeduardo.github.io`, localização "Brasil" (responsável).
- F2. Textos aprovados em 09/11/2026: "Sobre" PT/EN do LinkedIn, experiência (Asten AVMB, CentralEng, YourMentor, JET) e destaques (leadgate, LMS), em arquivos privados de perfil, fora do repositório; README do perfil PT/EN. O currículo reaproveita esses trechos, tirando a cidade.
- F3. Fatos do responsável: Desenvolvedor Full Stack e Analista de TI na CentralEng (LMS em produção com 20 colaboradores; lidera o sistema de gestão de PMOC); estágio de desenvolvimento no time de Inovação da Asten AVMB; Sistemas de Informação na AMF; 1º lugar no 1º Ideathon de SI da AMF (out/2025, equipe Mentor.Me); campeão do Coderace 2026 (AgroPlanner); cofundador do YourMentor desde jun/2026; JET no passado; processo: spec antes do código, TDD, PR revisado com CI, avaliação reservada em recursos com IA.
- F4. Projetos em destaque: leadgate (`gomesbeduardo/leadgate`, triagem de leads com IA, cerca de 570 testes, avaliação com conjunto reservado) e InfoHub InovAMF (`gomesbeduardo/infohub-inovamf`; descrição pública do repositório: jornada do empreendedor do InfoHub ao InovAMF, Next.js, TypeScript, Prisma e PostgreSQL, projeto da disciplina de Arquitetura de Sistemas, em dupla).
- F5. Do PDF antigo (só fatos): Asten AVMB desde out/2026, painel de chamados em produção usado nas reuniões da direção, com React, TypeScript, Vite, Tailwind, Vercel Functions, Postgres com Prisma, Vitest e Playwright; CentralEng como auxiliar administrativo de out/2025 a abr/2026 e como desenvolvedor desde mai/2026; AgroPlanner em jun/2026, em equipe, com 15 entrevistas antes do código e 10 horas de maratona; Bacharelado em SI na AMF de fev/2024 a dez/2028 (previsto); inglês avançado.
- F6. `google-chrome` está instalado na máquina local e no runner `ubuntu-latest`; `pdftotext` e `pdfinfo` estão na máquina local (verificado em 09/11).

## Suposições

- S1. A CentralEng continua como vínculo atual (mai/2026 até hoje), como dizem os textos de 09/11 e o pedido do responsável. O PDF de 02/11 dá fim em out/2026 (P2). Aparece na experiência.
- S2. O JET: até set/2026, 100 alunos de 4 escolas públicas (corrigido pelo responsável em 11/11/2026, resolve a P3).
- S3. Ordem das seções: contato, resumo, como trabalho, experiência, projetos, prêmios, formação, stack, idiomas. Sem foto.

## Regras

### R1. Fonte única

`src/data/curriculo.json` guarda tudo: `provisorio` (booleano, `true` até o responsável aprovar os textos, P1), `comum` (nome, local, e-mail, LinkedIn, GitHub, site) e um objeto por idioma (`pt`, `en`) com as mesmas chaves e o mesmo número de itens em cada lista; cada idioma traz `idioma` (código `lang`), `arquivo` (nome do PDF), `titulo`, `rotulos` e as seções. Texto só existe nesse arquivo; o gerador não tem texto de currículo embutido além dos rótulos de seção, que também ficam no JSON.

### R2. Privacidade

Nenhum texto do currículo (JSON, HTML intermediário, texto extraído do PDF) pode conter: telefone (sequências de 8 ou mais dígitos, com ou sem separadores, exceto anos e URLs), CPF ou RG, CEP, rua, avenida ou número de endereço, cidade ou estado brasileiros (lista pública genérica de capitais e siglas de estado, mais uma lista local opcional em `docs/privado/privacidade-local.json`, fora do git, com as cidades ligadas ao responsável; nenhum arquivo versionado cita essas cidades), data de nascimento, salário, estado civil, nem o nome de terceiros. Permitidos: os dados de F1. A verificação é uma função pura que devolve a lista de ocorrências, usada nos testes e pelo gerador antes de escrever o PDF.

### R3. Estilo do texto

Regras da skill `stop-slop`, nas duas línguas: fatos, números e onde cada coisa roda; sem frase de efeito, slogan, contraste retórico ("não é X, é Y"), abertura dramática, advérbio de ênfase nem travessão (U+2014). O teste procura o travessão e quatro padrões de contraste (`não é .* é `, `not .*, but `, `isn't .* it's`, `não .* mas sim`).

### R4. Geração

`node scripts/curriculo/gerar.mjs [--saida public/curriculo] [--chrome caminho]` monta um HTML por idioma a partir do JSON (fonte de sistema, folha A4, margens de 14 mm, texto real, sem imagem), roda `google-chrome --headless=new --print-to-pdf` e grava `public/curriculo/curriculo-eduardo-gomes-pt.pdf` e `curriculo-eduardo-gomes-en.pdf`. Antes de gravar, roda R2 sobre o HTML e falha com código 1 se houver ocorrência. Depois de gravar, conta as páginas (1 ou 2; fora disso, código 1). O binário do Chrome vem de `--chrome`, da variável `CHROME_BIN`, da lista `google-chrome`, `google-chrome-stable`, `chromium`, `chromium-browser`, `chrome-headless-shell` no PATH ou, por último, do `chrome-headless-shell` que o Playwright guarda em `~/.cache/ms-playwright`. No runner do Actions é o `google-chrome`; na máquina local, dentro do sandbox do Claude Code, o `google-chrome` não abre (não consegue criar o socket de instância única) e o gerador cai no headless shell do Playwright.

### R5. Onde os PDFs são gerados

Os PDFs são gerados no build do Actions (job `build` da spec 002 e `ci.yml`), antes do `astro build`, e não são versionados: `public/curriculo/*.pdf` entra no `.gitignore`. Assim o PDF publicado sempre corresponde ao JSON do commit. Alternativa rejeitada: versionar os PDFs (binário que muda a cada edição, risco de PDF desatualizado).

### R6. ATS

Texto selecionável e extraível (`pdftotext` devolve o nome e as seções), uma coluna, títulos de seção em texto, sem tabela para layout, sem ícone de fonte, links como texto visível (`linkedin.com/in/…`) além do hiperlink.

## Critérios de aceite

- C1. Dado `curriculo.json`, quando se comparam `pt` e `en`, então têm as mesmas chaves e o mesmo número de itens em cada lista (experiência, projetos, prêmios, formação, stack) (teste unitário).
- C2. Dado o texto `"Florianópolis, SC · +55 (11) 91234-5678"`, quando `verificarPrivacidade` roda, então devolve 3 ocorrências (cidade, estado, telefone). Dado `"Brasil · eduardobgomes100@gmail.com · linkedin.com/in/eduardo-gomes-pb · github.com/gomesbeduardo · fev/2024 – dez/2028"`, então devolve `[]` (teste unitário).
- C3. Dado o texto `"Não é um LMS, é uma plataforma <U+2014> completa"` (com o travessão real no lugar de `<U+2014>`), quando `verificarEstilo` roda, então devolve 2 ocorrências (travessão e contraste). Dado `"LMS em produção, usado por 20 colaboradores."`, então `[]` (teste unitário).
- C4. Dado `curriculo.json`, quando se concatena todo texto de `comum`, `pt` e `en`, então `verificarPrivacidade` e `verificarEstilo` devolvem `[]` (teste unitário sobre o arquivo real).
- C5. Dado `curriculo.json`, quando `renderizarHtml(dados, "pt")` roda, então o HTML contém o nome, "Brasil", o e-mail, os três links e cada título de seção de `pt.rotulos`; `lang="pt-BR"` em PT e `lang="en"` em EN (teste unitário).
- C6. Dado o Chrome instalado, quando `gerar.mjs` roda, então existem os dois PDFs, cada um com 1 ou 2 páginas, e `pdftotext` de cada um contém o nome e passa em `verificarPrivacidade` (teste de integração, pulado com aviso quando não há Chrome ou `pdftotext`).
- C7. Dado um JSON com `pt.comum` alterado para conter um telefone, quando `gerar.mjs` roda, então nenhum PDF é escrito e o código de saída é 1 (teste de integração).
- C8. `.gitignore` contém `public/curriculo/*.pdf`; `publicar.yml` e `ci.yml` chamam `node scripts/curriculo/gerar.mjs` antes do build (leitura dos arquivos).

## Testes de aceite

| # | Critério | Dado (entrada exata) | Ação | Resultado esperado | Tipo e arquivo |
|---|---|---|---|---|---|
| T1 | C1 | `src/data/curriculo.json` | `verificarEstrutura(dados)` | `[]`; com `en.experiencia` sem o último item, 1 erro citando `experiencia` | unidade, `scripts/curriculo/curriculo.test.mjs` |
| T2 | C2 | `"Florianópolis, SC · +55 (11) 91234-5678"` | `verificarPrivacidade` | 3 ocorrências, tipos `cidade`, `estado`, `telefone` | unidade |
| T3 | C2 | a linha de contato permitida de C2 | `verificarPrivacidade` | `[]` | unidade |
| T4 | C2 | `"CPF 123.456.789-00"`, `"Rua das Flores, 120"`, `"CEP 97000-000"`, `"nascido em 12/03/2004"` | `verificarPrivacidade` | 1 ou mais ocorrências em cada | unidade |
| T5 | C3 | `"Não é um LMS, é uma plataforma <U+2014> completa"` (com o travessão real no lugar de `<U+2014>`) | `verificarEstilo` | 2 ocorrências (`travessao`, `contraste`) | unidade |
| T6 | C4 | `curriculo.json` inteiro | `textoCompleto(dados)` → as duas verificações | `[]` e `[]` | unidade |
| T7 | C5 | `curriculo.json`, `"pt"` e `"en"` | `renderizarHtml` | contém nome, "Brasil", e-mail, 3 links, todos os rótulos; `lang` certo; nenhuma tag `<img>` nem `<table>` | unidade |
| T8 | C6 | PDFs em `public/curriculo/` | `contarPaginas`, `pdftotext` | 1 ou 2 páginas; texto contém "Eduardo Bergoli Gomes" e os títulos de experiência, projetos e formação (em maiúsculas, pela folha de estilo); `verificarPrivacidade(texto)` = `[]` | integração, pulado sem PDF ou sem poppler |
| T9 | C7 | JSON temporário com `"+55 (11) 91234-5678"` em `comum.local` | `node gerar.mjs --dados tmp.json --saida tmp/` | código 1, pasta de saída sem `.pdf` | integração |
| T10 | C8 | `.gitignore`, `publicar.yml`, `ci.yml` | `grep` | linhas presentes | manual, registrado no relatório |

## Conteúdo (provisório, P1)

Trechos reaproveitados dos textos aprovados, sem a cidade. Em PT:

- Título: Desenvolvedor Full Stack. Contato: Brasil · e-mail · linkedin.com/in/eduardo-gomes-pb · github.com/gomesbeduardo · gomesbeduardo.github.io.
- Resumo: "Desenvolvedor full stack na CentralEng, empresa de engenharia de climatização. Lá desenvolvi o LMS de treinamento técnico que 20 colaboradores usam hoje e lidero o desenvolvimento do sistema de gestão de PMOC. Desde out/2026 faço estágio de desenvolvimento no time de Inovação da Asten AVMB. Estudo Sistemas de Informação na AMF."
- Como trabalho: o parágrafo aprovado (spec curta com critérios de aceite, TDD, PR com revisão e CI, conjunto de avaliação reservado rodado uma vez).
- Experiência: Asten AVMB (out/2026 até hoje), CentralEng desenvolvedor (mai/2026 até hoje, S1), CentralEng auxiliar administrativo (out/2025 a abr/2026), YourMentor cofundador (jun/2026 até hoje), Projeto JET professor bolsista (fev/2026 a set/2026, S2). Itens com os textos aprovados da seção "Experiência" de `revisao-slop.md` e os fatos de F5.
- Projetos: leadgate, LMS de treinamento técnico, InfoHub InovAMF.
- Prêmios: Coderace 2026 (1º lugar, AgroPlanner, jun/2026); 1º Ideathon de SI da AMF (1º lugar, equipe Mentor.Me, out/2025).
- Formação: Bacharelado em Sistemas de Informação, AMF, fev/2024 a dez/2028 (previsto).
- Stack: TypeScript, JavaScript, Python, SQL; React, Next.js, Tailwind CSS; Node.js, Express, Prisma, PostgreSQL, Supabase; Vitest, Playwright, GitHub Actions, Docker, Linux, Git; n8n e APIs REST.
- Idiomas: Português (nativo), Inglês (avançado).

O EN é a tradução item a item, com os textos EN já aprovados onde existem.

## Fora do escopo

- Botão e página que linkam o PDF (spec 001).
- Currículo direcionado a uma vaga; carta de apresentação.
- Foto, QR code, versão em DOCX.
- Publicar os textos no LinkedIn ou no README do perfil.
- Dependência npm para gerar PDF: o Chrome do sistema basta (F6).

## Perguntas abertas

- P1. Os textos do currículo (seção "Conteúdo") são provisórios. O responsável aprova ou corrige antes do PR. Recomendação: aprovar como está, por reaproveitar os textos já aprovados em 09/11.
- P2. Vínculo com a CentralEng: atual (S1) ou encerrado em out/2026, como no PDF de 02/11. Impacto: data da experiência e o resumo. Recomendação: atual, porque é o que os textos de 09/11 dizem.
- P3. Resolvida em 11/11/2026: JET com 100 alunos de 4 escolas, até set/2026 (S2).
- P4. leadgate: "cerca de 570 testes" (fato do responsável) ou "mais de 400" (textos de 09/11). Recomendação: 570, que é o número mais novo; atualizar o LinkedIn e o README depois.
- P5. Incluir o 2º lugar no Ideathon 2026 e o ToPark (PDF antigo, fora dos fatos do responsável). Recomendação: fora, até o responsável pedir.
- P6. Nome dos arquivos: `curriculo-eduardo-gomes-pt.pdf` e `curriculo-eduardo-gomes-en.pdf`, ou `resume-eduardo-gomes.pdf` para o EN. Recomendação: manter um prefixo só, que o front end linka.
