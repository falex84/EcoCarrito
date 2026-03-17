// API Route para Vercel - Scraping de tasa BCV
// Endpoint: /api/bcv-rate

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Intentar obtener la tasa directamente del BCV
    const bcvUrl = 'https://www.bcv.org.ve/';
    
    const response = await fetch(bcvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al conectar con BCV: ${response.status}`);
    }

    const html = await response.text();
    const rate = parseBcvHtml(html);

    if (!rate || rate <= 0) {
      throw new Error('No se pudo extraer la tasa del HTML');
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        rate: rate,
        source: 'bcv.org.ve',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );

  } catch (error) {
    console.error('Error en API BCV:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback: true,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Analizar HTML del BCV para extraer la tasa de cambio
 */
function parseBcvHtml(html) {
  const foundRates = [];
  
  // Patrones específicos para el sitio del BCV - ordenados por prioridad
  const patterns = [
    // Patrón 1: "1 USD" seguido de número (la tasa oficial del BCV)
    [/1\s*USD[^0-9]*?(\d{3}(?:,\d{2,4}))/i, 'oficial'],
    
    // Patrón 2: "Dólar" seguido de número
    [/Dólar[^0-9]*?(\d{3}(?:,\d{2,4}))/i, 'dolar'],
    
    // Patrón 3: "Dolar" (sin tilde) seguido de número
    [/Dolar[^0-9]*?(\d{3}(?:,\d{2,4}))/i, 'dolar'],
    
    // Patrón 4: "USD" seguido de número
    [/USD[^0-9]*?(\d{3}(?:,\d{2,4}))/i, 'usd'],
    
    // Patrón 5: Número seguido de "Bs"
    [/(\d{3}(?:,\d{2,4}))\s*Bs/i, 'bs'],
  ];

  for (let i = 0; i < patterns.length; i++) {
    const [pattern, type] = patterns[i];
    const matches = html.match(pattern);
    
    if (matches) {
      let value = matches[1];
      value = value.replace(',', '.');
      const rate = parseFloat(value);
      
      if (rate >= 400 && rate <= 500) {
        foundRates.push({ rate, type, priority: i });
      }
    }
  }

  // Devolver la tasa de mayor prioridad
  if (foundRates.length > 0) {
    foundRates.sort((a, b) => a.priority - b.priority);
    return foundRates[0].rate;
  }

  // Búsqueda general como último recurso
  const numberPattern = /(\d{3}(?:,\d{2,4}))/g;
  const allNumbers = html.match(numberPattern) || [];
  
  for (const numStr of allNumbers) {
    const cleanNum = numStr.replace(',', '.');
    const num = parseFloat(cleanNum);
    
    if (num >= 440 && num <= 460) { // Rango muy estrecho para la tasa actual
      return num;
    }
  }

  return null;
}
