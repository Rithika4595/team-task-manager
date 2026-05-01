const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get tasks (filtered by project or assignee)
router.get('/', authenticate, async (req, res) => {
  const { projectId } = req.query;
  const where = req.user.role === 'ADMIN'
    ? (projectId ? { projectId: parseInt(projectId) } : {})
    : { OR: [{ assigneeId: req.user.id }, { creatorId: req.user.id }] };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(tasks);
});

// Create task (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { title, description, projectId, assigneeId, dueDate, priority } = req.body;
  if (!title || !projectId) return res.status(400).json({ error: 'Title and projectId required' });

  const task = await prisma.task.create({
    data: {
      title, description, projectId: parseInt(projectId),
      assigneeId: assigneeId ? parseInt(assigneeId) : null,
      creatorId: req.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'MEDIUM'
    },
    include: {
      assignee: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } }
    }
  });
  res.json(task);
});

// Update task status (any authenticated user can update their own tasks)
router.put('/:id', authenticate, async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  // Members can only update their own tasks; admins can update any
  if (req.user.role !== 'ADMIN' && task.assigneeId !== req.user.id)
    return res.status(403).json({ error: 'Not authorized' });

  const allowed = req.user.role === 'ADMIN'
    ? req.body
    : { status: req.body.status }; // members can only change status

  const updated = await prisma.task.update({
    where: { id: parseInt(req.params.id) },
    data: allowed,
    include: { assignee: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } }
  });
  res.json(updated);
});

// Delete task (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.task.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

module.exports = router;