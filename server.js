const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY; // Reemplaza con tu clave de Scraper API

app.use(express.static('public'));
app.use(express.json());

app.post('/scrape', async (req, res) => {
    const { url, containerClass, titleClass, priceClass, imageClass } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL es requerida' });
    }

    try {
        const apiUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);
        const $ = cheerio.load(response.data);

        const products = [];
        $(`.${containerClass}`).each((index, element) => {
            const title = $(element).find(`.${titleClass}`).text().trim();
            const price = $(element).find(`.${priceClass}`).text().trim() || 'Precio no disponible';
            const image = $(element).find(`.${imageClass}`).attr('src') || '';

            products.push({ title, price, image });
        });

        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
