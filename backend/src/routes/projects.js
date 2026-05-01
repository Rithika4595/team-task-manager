const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all projects for current user
router.get('/', authenticate, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: req.user.id },
        { members: { some: { userId: req.user.id } } }
      ]
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { tasks: true } }
    }
  });
  res.json(projects);
});

// Create project (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, memberIds } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const project = await prisma.project.create({
    data: {
      name, description,
      ownerId: req.user.id,
      members: {
        create: [
          { userId: req.user.id, role: 'ADMIN' },
          ...(memberIds || []).map(id => ({ userId: id, role: 'MEMBER' }))
        ]
      }
    },
    include: { members: true }
  });
  res.json(project);
});

// Add member to project (admin only)
router.post('/:id/members', authenticate, requireAdmin, async (req, res) => {
  const { userId } = req.body;
  const projectId = parseInt(req.params.id);
  try {
    const member = await prisma.projectMember.create({
      data: { projectId, userId, role: 'MEMBER' }
    });
    res.json(member);
  } catch {
    res.status(400).json({ error: 'Member already exists or invalid user' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

module.exports = router;