const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({ success: false, message: 'Title and project are required.' });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ success: false, message: 'Project not found.' });

    const member = projectDoc.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only project Admins can create tasks.' });
    }

    if (assignedTo) {
      const isProjectMember = projectDoc.members.some((m) => m.user.toString() === assignedTo);
      if (!isProjectMember) {
        return res.status(400).json({ success: false, message: 'Assigned user is not a member of this project.' });
      }
    }

    const task = await Task.create({
      title, description, project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority,
      dueDate: dueDate || null,
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'name' },
    ]);

    res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo } = req.query;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const member = project.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ success: false, message: 'Access denied.' });

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (member.role === 'Member') {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name members');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const isMember = task.project.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied.' });

    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const member = task.project.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ success: false, message: 'Access denied.' });

    if (member.role === 'Admin') {
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;

      if (assignedTo !== undefined) {
        if (assignedTo) {
          const isProjectMember = task.project.members.some((m) => m.user.toString() === assignedTo);
          if (!isProjectMember) {
            return res.status(400).json({ success: false, message: 'Assigned user is not a member of this project.' });
          }
        }
        task.assignedTo = assignedTo || null;
      }
    } else {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update tasks assigned to you.' });
      }
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, message: 'Members can only update task status.' });
      const validStatuses = ['To Do', 'In Progress', 'Done'];
      if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
      task.status = status;
    }

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(200).json({ success: true, message: 'Task updated.', task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const member = task.project.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Admins can delete tasks.' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTask, getTasksByProject, getTask, updateTask, deleteTask };
