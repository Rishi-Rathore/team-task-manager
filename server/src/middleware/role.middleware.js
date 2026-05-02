const Project = require('../models/Project');

const requireAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const member = project.members.find((m) => m.user.toString() === req.user._id.toString());

    if (!member) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    if (member.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    req.project = project;
    req.userRole = 'Admin';
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const requireMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const member = project.members.find((m) => m.user.toString() === req.user._id.toString());

    if (!member) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
    }

    req.project = project;
    req.userRole = member.role;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { requireAdmin, requireMember };
