
import { getStore } from '@netlify/blobs';

export default async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  };

  try {
    const store = getStore('feedback-pazienti');
    const risposte = [];

    const { blobs } = await store.list();

    for (const { key } of blobs) {
      const risposta = await store.get(key, { type: 'json' });
      if (risposta) risposte.push(risposta);
    }

    const totale = risposte.length;

    const conta = campo => risposte.reduce((a, r) => {
      const valore = r[campo];
      if (valore != null) {
        a[valore] = (a[valore] || 0) + 1;
      }
      return a;
    }, {});

    const mediaDi = campo => {
      const numeri = risposte
        .map(r => Number(r[campo]))
        .filter(n => Number.isFinite(n) && n >= 1 && n <= 5);
      return numeri.length
        ? numeri.reduce((a, b) => a + b, 0) / numeri.length
        : null;
    };

    const chiare = risposte.filter(
      r => r.informazioni_chiare === 'Sì'
    ).length;

    return Response.json({
      totale,
      media: mediaDi('valutazione_complessiva'),
      personale: mediaDi('personale'),
      chiare,
      servizi: conta('servizio'),
      valutazioni: conta('valutazione_complessiva')
    }, { headers });

  } catch (error) {
    console.error('Errore dashboard:', error);
    return Response.json(
      { error: 'Errore nel caricamento delle risposte' },
      { status: 500, headers }
    );
  }
};
  
