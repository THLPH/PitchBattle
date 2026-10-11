export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
  }

  try {
    const { songTitle, score, perfectHits, goodHits, misses, maxCombo, accuracy } = req.body || {};

    const prompt = `Sei un vocal coach esperto e un giudice musicale AI. Il giocatore ha appena cantato "${songTitle || 'You Are My Sunshine'}". 
Ha ottenuto un punteggio di ${score || 0}.
Hit Perfetti: ${perfectHits || 0}
Hit Buoni: ${goodHits || 0}
Mancati (Misses): ${misses || 0}
Combo Massima: ${maxCombo || 0}
Precisione: ${accuracy || 0}%

Analizza la sua performance in modo conciso (2-3 frasi). Sii incoraggiante ma fai notare se ha mancato molte note o se è stato estremamente preciso in base ai dati. Scrivi in italiano.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ feedback: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: 'Failed to generate content', details: data });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
