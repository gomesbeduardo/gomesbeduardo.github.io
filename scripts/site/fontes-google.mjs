// Fontes do Google nos e2e: a primeira resposta de cada URL fica guardada e serve todos os contextos.
// Sem acesso à rede o teste falha na hora com uma linha clara (cair em fonte do sistema tiraria o sentido da comparação).
export function fontesDoGoogle(aoFalhar) {
  const guardadas = new Map();
  const estado = { erro: null };
  async function servir(route) {
    const url = route.request().url();
    if (!guardadas.has(url)) {
      let r;
      try {
        r = await route.fetch();
      } catch (e) {
        if (!estado.erro) {
          estado.erro = `${url} ${String(e.message).split('\n').find((l) => l.trim()) || e}`;
          console.log(`FAIL  fontes do Google inacessíveis: ${estado.erro}`);
          aoFalhar();
        }
        return route.abort().catch(() => {});
      }
      if (!r.ok()) return route.abort();
      guardadas.set(url, { status: r.status(), headers: r.headers(), body: await r.body() });
    }
    return route.fulfill(guardadas.get(url));
  }
  return { servir, estado };
}
