const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/stats', authenticate, async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN';
  const userFilter = isAdmin ? {} : { OR: [{ assigneeId: req.user.id }, { creatorId: req.user.id }] };

  const [total, todo, inProgress, done, overdue, projects] = await Promise.all([
    prisma.task.count({ where: userFilter }),
    prisma.task.count({ where: { ...userFilter, status: 'TODO' } }),
    prisma.task.count({ where: { ...userFilter, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...userFilter, status: 'DONE' } }),
    prisma.task.count({
      where: {
        ...userFilter,
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      }
    }),
    prisma.project.count({
      where: isAdmin ? {} : {
        OR: [{ ownerId: req.user.id }, { members: { some: { userId: req.user.id } } }]
      }
    })
  ]);

  res.json({ total, todo, inProgress, done, overdue, projects });
});

module.exports = router;