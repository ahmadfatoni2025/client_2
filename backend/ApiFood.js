// ApiFood.js - Example for searching food data
// Run this with: node ApiFood.js

import axios from 'axios';

const searchQuery = "Ayam"; // Example search

async function searchFood(query) {
    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
        const response = await axios.get(url);

        const products = response.data.products.map(p => ({
            name: p.product_name,
            id: p.code,
            nutriments: p.nutriments
        }));

        console.log("Search Results:", JSON.stringify(products.slice(0, 5), null, 2));
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

searchFood(searchQuery);