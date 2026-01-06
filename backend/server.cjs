const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Perhatikan: pakai .cjs di akhir
const financeRoutes = require('./routes/financeRoutes.cjs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inisialisasi Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables! Check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase connected to:", supabaseUrl);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Server connected to Supabase & Finance API",
    usage: "Access data using: /api/{table-name} or /api/finance",
    examples: [
      "/api/pemasok",
      "/api/menu",
      "/api/users",
      "/api/products",
      "/api/finance",
      "/api/transaksi"
    ],
    note: "Replace {table-name} with your actual table name in Supabase"
  });
});

// ========== ENDPOINT FINANCE ==========
app.use('/api/finance', financeRoutes);

// ========== ENDPOINT DINAMIS UNTUK SEMUA TABEL ==========
// Format: /api/{nama_tabel}
app.get("/api/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const {
      limit = 100,
      offset = 0,
      order_by = "created_at",
      order = "desc",
      select = "*",
      ...filters
    } = req.query;

    console.log(`📊 Fetching data from table: ${table}`);

    // Query dasar
    let query = supabase
      .from(table)
      .select(select);

    // Filtering dinamis
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });

    // Sorting
    try {
      query = query.order(order_by, { ascending: order === "asc" });
    } catch (e) {
      console.warn(`Could not order by ${order_by}`);
    }

    // Pagination
    query = query.range(offset, parseInt(offset) + parseInt(limit) - 1);

    // Eksekusi query
    const { data, error, count } = await query;

    if (error) {
      console.error(`❌ Error fetching from ${table}:`, error);
      return res.status(500).json({
        error: error.message,
        details: error.details,
        hint: "Check if table exists in Supabase"
      });
    }

    console.log(`✅ Retrieved ${data?.length || 0} records from ${table}`);

    res.json({
      success: true,
      table: table,
      count: data?.length || 0,
      total: count || data?.length || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: data || []
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// ========== ENDPOINT UNTUK MENAMBAH DATA ==========
// Format: POST /api/{nama_tabel}
app.post("/api/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        error: "Request body is empty",
        hint: "Send JSON data in the request body"
      });
    }

    console.log(`📝 Inserting data into ${table}:`, body);

    const { data, error } = await supabase
      .from(table)
      .insert([body])
      .select();

    if (error) {
      console.error(`❌ Error inserting into ${table}:`, error);
      return res.status(500).json({
        error: error.message,
        details: error.details,
        code: error.code
      });
    }

    console.log(`✅ Data inserted into ${table}`);

    res.status(201).json({
      success: true,
      message: `Data added to ${table} successfully`,
      data: data ? data[0] : null
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// ========== ENDPOINT UNTUK UPDATE DATA ==========
// Format: PUT /api/{nama_tabel}/{id}
app.put("/api/:table/:id", async (req, res) => {
  try {
    const { table, id } = req.params;
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        error: "Request body is empty",
        hint: "Send JSON data to update"
      });
    }

    console.log(`✏️ Updating ${table} record ID: ${id}`, body);

    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      console.error(`❌ Error updating ${table}:`, error);
      return res.status(500).json({
        error: error.message,
        details: error.details
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Record not found",
        hint: `No record found with id: ${id} in table: ${table}`
      });
    }

    console.log(`✅ Record ${id} updated in ${table}`);

    res.json({
      success: true,
      message: `Record updated in ${table} successfully`,
      data: data[0]
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// ========== ENDPOINT UNTUK DELETE DATA ==========
// Format: DELETE /api/{nama_tabel}/{id}
app.delete("/api/:table/:id", async (req, res) => {
  try {
    const { table, id } = req.params;

    console.log(`🗑️ Deleting ${table} record ID: ${id}`);

    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error(`❌ Error deleting from ${table}:`, error);
      return res.status(500).json({
        error: error.message,
        details: error.details
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Record not found",
        hint: `No record found with id: ${id} in table: ${table}`
      });
    }

    console.log(`✅ Record ${id} deleted from ${table}`);

    res.json({
      success: true,
      message: `Record deleted from ${table} successfully`,
      deleted_data: data[0]
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// ========== ENDPOINT UNTUK MENDAPATKAN 1 DATA ==========
// Format: GET /api/{nama_tabel}/{id}
app.get("/api/:table/:id", async (req, res) => {
  try {
    const { table, id } = req.params;

    console.log(`🔍 Fetching ${table} record ID: ${id}`);

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`❌ Error fetching from ${table}:`, error);
      return res.status(500).json({
        error: error.message,
        details: error.details
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "Record not found",
        hint: `No record found with id: ${id} in table: ${table}`
      });
    }

    console.log(`✅ Record ${id} found in ${table}`);

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

// ========== ENDPOINT FOOD SEARCH (PROXY OFF) ==========
app.get("/api/proxy/food-search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    console.log(`🔍 Searching Open Food Facts for: ${query}`);

    // Menggunakan API Open Food Facts (OFF) melalui axios
    const axios = require('axios');
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        fields: 'product_name,nutriments,image_url,code,_id'
      }
    });

    const data = response.data;

    const results = data.products.map(p => ({
      id: p._id || p.code,
      name: p.product_name || "Unknown Product",
      calories: Math.round(p.nutriments?.["energy-kcal_100g"] || 0),
      protein: p.nutriments?.protein_100g || 0,
      carbs: p.nutriments?.carbohydrates_100g || 0,
      fat: p.nutriments?.fat_100g || 0,
      image: p.image_url
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("💥 Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch from Open Food Facts", message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});