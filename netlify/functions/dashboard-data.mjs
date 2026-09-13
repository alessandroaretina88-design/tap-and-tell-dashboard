import { getStore } from '@netlify/blobs';

export default async () => {
  try {
    const store = getStore('feedback-pazienti');
    const { blobs } = await store.list();
    const risposte = (await Promise.all(
      blobs.map(({ key }) => store.get(key, { type: 'json' }))
    )).filter(Boolean);
    const totale = risposte.length;
    const conta = campo => risposte.reduce((a, r) => {
      a[r[campo]] = (a[r[campo]] || 0) + 1;
      return a;
    }, {});
    const mediaDi = campo => totale
      ? risposte.reduce((s, r) => s + Number(r[campo]), 0) / totale
      : null;
    const chiare = risposte.filter(
      r => r.informazioni_chiare === 'Sì'
    ).length;
        return Response.json({
      totale,
      media: mediaDi('valutazione_complessiva'),
      personale: mediaDi('personale'),
      chiarePercent: totale
        ? Math.round(chiare * 100 / totale) : null,
      chiareTesto: totale ? `${chiare} su ${totale}` : null,
      servizi: conta('servizio'),
      chiarezza: conta('informazioni_chiare'),
      commenti: risposte
        .filter(r => r.commento)
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 20)
        .map(r => ({
          testo: r.commento,
          data: new Date(r.data).toLocaleDateString('it-IT')
        }))
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (errore) {
    console.error(errore);
    return Response.json(
      { error: 'Impossibile leggere i feedback' },
      { status: 500 }
    );
  }
};
