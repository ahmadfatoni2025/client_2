const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Perhatikan: pakai .cjs di akhir
const financeRoutes = require('./routes/financeRoutes.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log("✅ Supabase connected to:", process.env.SUPABASE_URL);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Server connected to Supabase",
    usage: "Access data using: /api/{table-name}",
    examples: [
      "/api/pemasok",
      "/api/menu",
      "/api/users",
      "/api/products"
    ],
    note: "Replace {table-name} with your actual table name in Supabase"
  });
});

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
    query = query.order(order_by, { ascending: order === "asc" });

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

// ========== ENDPOINT UNTUK CEK TABEL YANG ADA ==========
app.get("/api-tables", async (req, res) => {
  try {
    // Catatan: Supabase tidak menyediakan endpoint langsung untuk list tables
    // Anda perlu mengetahui nama tabel terlebih dahulu
    // Ini hanya endpoint informasi
    res.json({
      note: "Supabase doesn't provide direct table listing via API",
      suggestion: "You need to know your table names beforehand",
      common_tables: ["users", "products", "orders", "customers", "pemasok", "menu"],
      usage: "Access tables using: /api/{table-name}",
      example: "GET /api/pemasok"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});