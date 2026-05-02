const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// All routes require authentication
router.use(protect);

router.route('/').get(getProjects).post(createProject);

router.route('/:id').get(getProject).put(requireAdmin, updateProject).delete(requireAdmin, deleteProject);

router.route('/:projectId/members').post(requireAdmin, addMember);

router.route('/:projectId/members/:userId').delete(requireAdmin, removeMember);

module.exports = router;
