const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

router.route('/').post(createTask);

router.route('/project/:projectId').get(getTasksByProject);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
