const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController.cjs');

// Perhatikan: pakai .cjs di akhir
const budgetController = require('../controllers/budgetController.cjs');
const payrollController = require('../controllers/payrollController.cjs');
const reportController = require('../controllers/reportController.cjs'); // <--- BARU
const dashboardController = require('../controllers/dashboardController.cjs'); // <--- TAMBAH IN

// URL: /api/finance/budgets
router.get('/budgets', budgetController.getBudgets);
router.post('/budgets', budgetController.createBudget);

// Route Anggaran
router.get('/budgets', budgetController.getBudgets);
router.post('/budgets', budgetController.createBudget);

// 2. Route Transaksi (BARU)
router.post('/transactions', transactionController.createTransaction);
// --- ROUTE PAYROLL (Salin Bagian Ini) ---
router.get('/employees', payrollController.getEmployees);
router.post('/employees', payrollController.addEmployee);
router.post('/payroll/generate', payrollController.generatePayroll);
router.get('/payroll/history', payrollController.getPayrollHistory);
router.get('/report/summary', reportController.getFinancialSummary);
// --- ROUTE DASHBOARD (Letakkan paling bawah sebelum module.exports) ---
router.get('/dashboard/summary', dashboardController.getDashboardStats);

module.exports = router;