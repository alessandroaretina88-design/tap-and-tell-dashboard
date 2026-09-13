import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

const headers = {
  'Access-Control-Allow-Origin': 'https://alessandroaretina88-design.github.io',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Metodo non consentito' },
      { status: 405, headers });
  }

  try {
    const d = await request.json();
    const servizi = [
      'Accettazione / Front Office',
      'Ambulatorio',
      'Diagnostica / Esami',
      'Reparto di degenza',
      'Altro'
    ];
    const voti = ['1', '2', '3', '4', '5'];
    const risposteChiarezza = ['Sì', 'In parte', 'No'];

    if (!servizi.includes(d.servizio) ||
        !voti.includes(d.valutazione_complessiva) ||
        !voti.includes(d.personale) ||
        !risposteChiarezza.includes(d.informazioni_chiare) ||
        typeof d.commento !== 'string' ||
        d.commento.length > 1000) {
      return Response.json({ error: 'Risposte non valide' },
        { status: 400, headers });
    }

    await getStore('feedback-pazienti').setJSON(randomUUID(), {
      servizio:
