# Spec 004: currículo completo no site, no PDF e no README

Estado: aprovada pelo responsável em 11/11/2026. Data: 11/11/2026.

## Pedido literal

> use esse currículo como base, tem detalhes que ficaram de fora.
>
> Em tudo, mas não cite [a empresa da vaga] nem nada, apenas some experiência e afins onde for possível.
>
> Pôr cidade, sem telefone.

## Problema

O currículo que o responsável mandou como base (versão de 11/2026, escrita para uma vaga e guardada fora do repositório) tem fatos que o site, o `src/data/curriculo.json` e o README não têm. Faltam o ToPark, o 2º lugar no Ideathon 2026, a promoção na CentralEng, a integração RPA na Asten, os detalhes do JET, o voluntariado, as certificações e parte da stack. Em três pontos as datas e os números discordam do site. O recrutador que compara o PDF com o LinkedIn encontra versões diferentes.

## Fatos

- F1. Fonte: o PDF que o responsável mandou, lido em 11/11/2026. A spec não cita a empresa da vaga, e nenhum arquivo versionado vai citar.
- F2. Os textos do currículo vivem em `src/data/curriculo.json` (spec 003, R1). Os PDFs publicados pela v1 ficam em `site/curriculo/`, copiados do que o `scripts/curriculo/gerar.mjs` grava em `public/curriculo/`.
- F3. Os textos do site estão escritos à mão em `site/index.html` (PT) e `site/en/index.html` (EN), nas seções Sobre, Trajetória, Experiência e formação, e Stack, e na linha abaixo dos botões do topo da página.
- F4. A spec 003, R2, proíbe cidade e estado em qualquer texto do currículo. O teste `verificarPrivacidade` reprova os dois. O responsável decidiu em 11/11/2026 pôr a cidade e manter o telefone fora.

## Decisões já tomadas

- D1. As mudanças entram no JSON e nos PDFs do currículo, no site em PT e EN e no README.
- D2. Nenhum texto cita a vaga nem a empresa para a qual o PDF base foi escrito. A frase sobre disponibilidade para mudança de cidade fica fora. A spec 003 cita essa empresa na seção Problema, e essa citação sai na mesma entrega.
- D3. A cidade entra como "Santa Maria, RS" (em inglês, "Santa Maria, Brazil"). O telefone continua proibido.
- D4. A foto que o responsável mandou em 11/11/2026 (a mesma do avatar do GitHub, que tem 460 px; o LinkedIn exige login) entra no site, no lugar do círculo "EG" do topo da página (moldura já prevista no `PRODUCT.md`), e no PDF do currículo, no cabeçalho. Isso altera a spec 003, R4, que pedia "sem imagem". O texto do PDF continua selecionável e legível por ATS: a foto não substitui nenhum texto.

## Mudança na geração do PDF (altera a spec 003, R4)

O HTML de cada idioma ganha a foto no cabeçalho, circular, com cerca de 28 mm, e `alt` com o nome. O arquivo da foto fica versionado em `site/img/eduardo-gomes.jpg`, com 460 px de lado (o tamanho do avatar), e o site e o gerador usam o mesmo arquivo. O PDF continua com 1 ou 2 páginas, e o teste de ATS (spec 003, R6) continua valendo.

## Mudança na regra de privacidade (altera a spec 003, R2)

R2 passa a permitir um único local, o valor de `comum.local` no JSON, exatamente "Santa Maria, RS" (e "Santa Maria, Brazil" no EN). Qualquer outra cidade ou estado continua reprovando. Telefone, CPF, RG, CEP, endereço, data de nascimento, salário e estado civil continuam proibidos. A lista local `docs/privado/privacidade-local.json` continua valendo para as outras cidades. Quem mantém esse arquivo precisa tirar "Santa Maria" dele, ou a verificação vai reprovar o próprio `comum.local`.

## Correção: o LMS está em validação

O LMS da CentralEng está em validação com colaboradores e não está em produção (responsável, 11/11/2026). O texto não dá número de colaboradores. Todo texto que diz "20 colaboradores", "em produção", "roda na CentralEng" ou "usado por" sobre o LMS passa a dizer que ele está em validação com colaboradores ("in validation with employees" no EN), sem número. Isso vale para o JSON, o site (`site/index.html`, `site/en/index.html`, `site/projeto-lms.html`, `site/en/projeto-lms.html`, inclusive a meta description e a tabela de Stack), o README e o `PRODUCT.md`. O painel da Asten continua "em produção".

## O que entra

| Item | JSON e PDF | Site (PT e EN) | README |
|---|---|---|---|
| Foto | cabeçalho do PDF | topo da página, no lugar do "EG" | não |
| Cidade "Santa Maria, RS" | `comum.local` | linha do topo da página, no lugar de "Brasil"; Contato | não |
| Título "Desenvolvedor full stack, IA aplicada e automação" | `titulo` | subtítulo do topo e `<title>` | primeira frase |
| CentralEng, desenvolvedor full stack e analista de TI, de mai/2026 até hoje, sob demanda | Experiência, com "sob demanda" na data | Experiência e Trajetória; o Sobre diz que segue atendendo a CentralEng sob demanda; a linha do topo troca "Full stack na CentralEng" por "Estágio na Asten AVMB" | não |
| CentralEng: LMS feito sozinho, da arquitetura aos testes, com PRD (20 requisitos), ADRs e backlog de 36 itens, em validação com colaboradores; levantamento e modelagem do PMOC; CI com lint e build a cada push | Experiência | Experiência | não |
| Promoção de auxiliar administrativo a desenvolvedor em 7 meses, depois de automatizar rotinas do setor | Experiência (auxiliar) | Trajetória | não |
| Asten: dash-asten com KPIs por situação, SLA vencido e chamados abertos há 60 dias ou mais, exibido em TV; desenvolvimento por specs com agentes de IA e aprovação humana antes do merge; PRD com mais de 100 decisões | Experiência | Experiência | não |
| Integração RPA: recebe dados em JSON de um sistema externo e envia notificações por WhatsApp e e-mail, com scripts de validação em Python (RestrictedPython, em sandbox). Sem citar a Asten, o cliente nem o setor | Stack, grupo "Automação e integrações" | tabela de Stack, linha de Python, com "integração RPA" na coluna de onde usei | não |
| YourMentor: back-end em Python, FastAPI e PostgreSQL; arquitetura, modelo de dados e monetização | Experiência | Trajetória | não |
| ToPark, fundador, abr/2024 a out/2025: startup de reserva antecipada de vagas de estacionamento, selecionada para a primeira turma da incubadora InovAMF; back-end em Python, modelo de negócio e captação de estacionamentos parceiros | Projetos | Trajetória | não |
| JET até out/2026: Python, HTML, CSS, Arduino e uso responsável de IA para mais de 100 alunos de 4 escolas públicas; 2 escolas a mais depois do primeiro semestre, por indicação da coordenação; workshop de 80 minutos sobre IA para professores da AMF | Experiência | Trajetória | não |
| 2º lugar no Ideathon de SI da AMF, 2026, sem mês nem equipe | Prêmios | Trajetória | lista de destaques |
| Voluntariado: vice-presidente do Diretório Acadêmico de SI (secretário desde mar/2025); assistente financeiro da organização do Code Race 2026, desde mar/2026, só nas finanças e sem papel na avaliação das equipes; comissão organizadora do IX Code Race (28 h, 2025) e da Semana Acadêmica de SI (40 h, 2025) | seção nova `voluntariado` | Trajetória, os 4 itens (passa de 9 para 13 marcos) | não |
| Certificações: Fundamentos de Python, O Básico de Git e GitHub e NLW Pocket JavaScript (Rocketseat); Cria Summit 2025 (8 h) | seção nova `certificacoes` | não | não |
| Stack: Python, FastAPI, Vite, shadcn/ui, Recharts, Vercel Functions, Neon, SheetJS, Portainer, GitLab, Codex | Stack | faixa e tabela de Stack | não |

O "6º semestre" fica fora; a formação mantém a previsão de conclusão em dez/2028.

## Critérios de aceite

- C1. Dado o `curriculo.json` atualizado, quando os testes rodam, então `pt` e `en` têm as mesmas chaves e o mesmo número de itens, inclusive em `voluntariado` e `certificacoes` (teste unitário).
- C2. Dado "Santa Maria, RS" como `comum.local`, quando `verificarPrivacidade` roda, então devolve `[]`. Dado "Porto Alegre, RS" ou "+55 (55) 91234-5678", então devolve ao menos uma ocorrência (teste unitário).
- C3. Dado o repositório depois da entrega, quando se procura o nome da empresa da vaga em todos os arquivos versionados, então não há ocorrência; e "Florianópolis" não aparece no JSON, em `site/` nem no README (teste unitário sobre o JSON; `git grep` manual no resto, porque a spec 003 usa "Florianópolis" como exemplo de teste).
- C4. Dado o JSON, o site e o README, quando se procura "Asten" ou "operadora" junto de "RPA", "WhatsApp" ou "guias", então não há ocorrência (teste unitário sobre o JSON; `grep` manual no resto).
- C5. Dado o JSON, o site, o README e o `PRODUCT.md`, quando se procura "20 colaboradores", "20 employees" e frases que digam que o LMS está em produção, então não há ocorrência, nenhum número de colaboradores aparece junto do LMS, e "validação" ou "validation" aparece (teste unitário sobre o JSON; `grep` manual no resto).
- C6. Dado o Chrome instalado, quando `gerar.mjs` roda, então cada PDF tem 1 ou 2 páginas, traz a foto e o texto extraído contém "ToPark", "Ideathon" com "2026" e "Santa Maria" (teste de integração). Os PDFs gerados são copiados para `site/curriculo/`.
- C7. Dado o site servido localmente em 390 px e 1280 px, nos temas claro e escuro, quando se abre `/` e `/en/`, então a foto aparece no lugar do "EG", com `alt` "Eduardo Gomes" e sem distorção; Trajetória, Experiência e Stack mostram os itens da tabela acima; e nada passa da largura da tela (conferência visual com print e medida do Playwright).
- C8. Dado o README, quando se lê, então a lista de destaques traz o 2º lugar no Ideathon 2026, o LMS aparece em validação e nenhuma frase cita a vaga (leitura).
- C9. `node --test 'scripts/**/*.test.mjs'` passa inteiro.

## Fora do escopo

- Página de projeto para o ToPark ou para o YourMentor.
- Telefone, data de nascimento e qualquer dado de contato além de e-mail, LinkedIn, GitHub, site e cidade.
- Mudança de layout ou de design do site, além da foto no lugar do "EG".
- A migração para Astro (spec 001).

## Respostas do responsável (11/11/2026)

- CentralEng: continua, em meio período e sob demanda.
- JET: termina em out/2026.
- LMS: em validação com colaboradores, sem número e sem "produção" (a resposta "30" foi trocada por esta na aprovação).
- Título: "Desenvolvedor full stack, IA aplicada e automação".
- Ideathon 2026: só o ano.
- Code Race 2026: o mesmo evento; ele ficou só nas finanças da organização, sem interferir no resultado.
- Integração RPA: entra sem nada que remeta à Asten ou ao cliente.
- ToPark: primeira turma da incubadora InovAMF.
- "6º semestre": fora.
- Voluntariado: os 4 itens entram na Trajetória.
- Foto: a do avatar do GitHub, a mesma da conversa, porque o LinkedIn exige login.

## Suposições

- S1. "Sem papel na avaliação das equipes" descreve a frase do responsável "fiquei só no financeiro, então não interfere no resultado". Se a frase não puder aparecer assim, o voluntariado diz só "assistente financeiro da organização".
- S2. A integração RPA entra na Stack, e não na experiência da Asten, porque citar o cargo já remeteria à empresa.
