const express = require('express');
const { getCategories, createCategory } = require('../controllers/categories');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

module.exports = router;
