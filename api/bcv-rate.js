// API Route para Vercel - Scraping de tasa BCV
// Endpoint: /api/bcv-rate

import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const url = 'https://www.bcv.org.ve/';
    
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });

    if (!response || !response.data) {
      throw new Error('La respuesta del BCV es nula o no tiene datos');
    }

    const $ = cheerio.load(response.data);
    const data = $('#dolar strong').text();
    
    if (!data) {
      throw new Error('No se encontró la tasa del dólar en el HTML del BCV');
    }

    const rateFormatted = Number(data.replace(',', '.'));

    if (!rateFormatted || rateFormatted <= 0) {
      throw new Error('Tasa inválida obtenida del BCV');
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        bcvRate: rateFormatted,
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
    console.error('Error en API BCV:', error.message);
    
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
