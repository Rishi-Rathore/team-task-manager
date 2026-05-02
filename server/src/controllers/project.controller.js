const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required.' });

    const project = await Project.create({ name, description, createdBy: req.user._id });
    await project.populate('members.user', 'name email');

    res.status(201).json({ success: true, message: 'Project created.', project });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const projectsWithRole = projects.map((p) => {
      const pObj = p.toObject();
      const member = p.members.find((m) => m.user._id.toString() === req.user._id.toString());
      pObj.myRole = member ? member.role : 'Member';
      return pObj;
    });

    res.status(200).json({ success: true, projects: projectsWithRole });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const member = project.members.find((m) => m.user._id.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ success: false, message: 'Access denied.' });

    const pObj = project.toObject();
    pObj.myRole = member.role;

    res.status(200).json({ success: true, project: pObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = req.project;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate('members.user', 'name email');

    res.status(200).json({ success: true, message: 'Project updated.', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = req.project;
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.status(200).json({ success: true, message: 'Project and all tasks deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = req.project;

    if (!email) return res.status(400).json({ success: false, message: 'User email is required.' });

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ success: false, message: 'User not found.' });

    const alreadyMember = project.members.some((m) => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(409).json({ success: false, message: 'User is already a member.' });

    project.members.push({ user: userToAdd._id, role: role === 'Admin' ? 'Admin' : 'Member' });
    await project.save();
    await project.populate('members.user', 'name email');

    res.status(200).json({ success: true, message: 'Member added.', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself.' });
    }

    const memberIndex = project.members.findIndex((m) => m.user.toString() === userId);
    if (memberIndex === -1) return res.status(404).json({ success: false, message: 'Member not found.' });

    project.members.splice(memberIndex, 1);
    await project.save();
    await project.populate('members.user', 'name email');

    res.status(200).json({ success: true, message: 'Member removed.', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember };
