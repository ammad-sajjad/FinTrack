const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense, getSummary } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/summary', getSummary);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
