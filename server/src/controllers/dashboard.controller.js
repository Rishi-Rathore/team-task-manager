const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({ 'members.user': userId }).select('_id name members');
    const projectIds = projects.map((p) => p._id);

    const adminProjectIds = projects
      .filter((p) => {
        const m = p.members.find((m) => m.user.toString() === userId.toString());
        return m && m.role === 'Admin';
      })
      .map((p) => p._id);

    const memberProjectIds = projects
      .filter((p) => {
        const m = p.members.find((m) => m.user.toString() === userId.toString());
        return m && m.role === 'Member';
      })
      .map((p) => p._id);

    let taskFilter;
    if (adminProjectIds.length > 0 && memberProjectIds.length > 0) {
      taskFilter = {
        $or: [
          { project: { $in: adminProjectIds } },
          { project: { $in: memberProjectIds }, assignedTo: userId },
        ],
      };
    } else if (adminProjectIds.length > 0) {
      taskFilter = { project: { $in: adminProjectIds } };
    } else if (memberProjectIds.length > 0) {
      taskFilter = { project: { $in: memberProjectIds }, assignedTo: userId };
    } else {
      taskFilter = { _id: null }; // no projects
    }

    const allTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    const now = new Date();
    const totalTasks = allTasks.length;
    const tasksByStatus = { 'To Do': 0, 'In Progress': 0, Done: 0 };
    const overdueTasks = [];
    const tasksByUser = {};

    allTasks.forEach((task) => {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;

      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
        overdueTasks.push(task);
      }

      if (task.assignedTo) {
        const key = task.assignedTo._id.toString();
        if (!tasksByUser[key]) {
          tasksByUser[key] = { user: task.assignedTo, count: 0, tasks: [] };
        }
        tasksByUser[key].count += 1;
        tasksByUser[key].tasks.push({
          _id: task._id, title: task.title, status: task.status,
          priority: task.priority, dueDate: task.dueDate,
        });
      }
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalProjects: projects.length,
        totalTasks,
        tasksByStatus,
        overdueTasks: overdueTasks.map((t) => ({
          _id: t._id, title: t.title, status: t.status,
          priority: t.priority, dueDate: t.dueDate,
          project: t.project, assignedTo: t.assignedTo,
        })),
        overdueCount: overdueTasks.length,
        tasksByUser: Object.values(tasksByUser),
        recentTasks: allTasks
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((t) => ({
            _id: t._id, title: t.title, status: t.status,
            priority: t.priority, dueDate: t.dueDate,
            project: t.project, assignedTo: t.assignedTo,
          })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
