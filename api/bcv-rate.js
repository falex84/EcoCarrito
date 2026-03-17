// API Route para Vercel - Scraping de tasa BCV
// Implementación basada en: https://github.com/faugustdev/getBCVRate
// Endpoint: /api/bcv-rate

import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const url = 'https://www.bcv.org.ve/';

  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
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
      console.error('La respuesta de Axios es nula o no tiene datos.');
      return res.status(500).json({
        success: false,
        message: 'Error en la respuesta de la solicitud'
      });
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

    console.log(`BCV Rate: ${rateFormatted}`);

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      bcvRate: rateFormatted,
      source: 'bcv.org.ve',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en API BCV:', error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
