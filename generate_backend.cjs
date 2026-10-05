const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'server', 'src');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

// Ensure all dirs exist
['repositories', 'services', 'controllers', 'routes', 'middleware', 'validators', 'types'].forEach(dir => ensureDir(path.join(SRC, dir)));

// 1. Types
fs.writeFileSync(path.join(SRC, 'types', 'index.ts'), `
export interface Pagination {
  page: number;
  limit: number;
}
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
`);

// 2. Repositories
const repos = {
  'authRepository.ts': `
import { query } from '../db';
export const authRepo = {
  findByEmail: async (email: string) => {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }
};
`,
  'memberRepository.ts': `
import { query } from '../db';
export const memberRepo = {
  findAll: async (search?: string, department?: string, page = 1, limit = 20) => {
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params: any[] = [];
    if (search) {
      params.push(\`%\${search}%\`);
      sql += \` AND (full_name ILIKE $\${params.length} OR register_number ILIKE $\${params.length})\`;
    }
    if (department) {
      params.push(department);
      sql += \` AND department = $\${params.length}\`;
    }
    const countRes = await query(sql.replace('*', 'COUNT(*) as total'), params);
    const total = parseInt(countRes.rows[0].total);
    
    sql += \` LIMIT \${limit} OFFSET \${(page - 1) * limit}\`;
    const res = await query(sql, params);
    return { items: res.rows, total, page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM members WHERE id = $1', [id]);
    return res.rows[0];
  }
};
`,
  'achievementRepository.ts': `
import { query } from '../db';
export const achievementRepo = {
  findAll: async (page = 1, limit = 20) => {
    const res = await query(\`SELECT * FROM achievements LIMIT $1 OFFSET $2\`, [limit, (page - 1) * limit]);
    const count = await query('SELECT COUNT(*) FROM achievements');
    return { items: res.rows, total: parseInt(count.rows[0].count), page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM achievements WHERE id = $1', [id]);
    return res.rows[0];
  },
  create: async (data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
    const res = await query(\`INSERT INTO achievements (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING *\`, vals);
    return res.rows[0];
  },
  update: async (id: string, data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => \`\${k} = $\${i + 1}\`).join(', ');
    vals.push(id);
    const res = await query(\`UPDATE achievements SET \${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $\${vals.length} RETURNING *\`, vals);
    return res.rows[0];
  },
  delete: async (id: string) => {
    await query('DELETE FROM achievements WHERE id = $1', [id]);
  }
};
`,
  'updateRepository.ts': `
import { query } from '../db';
export const updateRepo = {
  findAll: async (page = 1, limit = 20) => {
    const res = await query(\`SELECT * FROM updates LIMIT $1 OFFSET $2\`, [limit, (page - 1) * limit]);
    const count = await query('SELECT COUNT(*) FROM updates');
    return { items: res.rows, total: parseInt(count.rows[0].count), page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM updates WHERE id = $1', [id]);
    return res.rows[0];
  },
  create: async (data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
    const res = await query(\`INSERT INTO updates (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING *\`, vals);
    return res.rows[0];
  },
  update: async (id: string, data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => \`\${k} = $\${i + 1}\`).join(', ');
    vals.push(id);
    const res = await query(\`UPDATE updates SET \${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $\${vals.length} RETURNING *\`, vals);
    return res.rows[0];
  },
  delete: async (id: string) => {
    await query('DELETE FROM updates WHERE id = $1', [id]);
  }
};
`,
  'projectRepository.ts': `
import { query } from '../db';
export const projectRepo = {
  findAll: async (page = 1, limit = 20) => {
    const res = await query(\`
      SELECT p.*, COUNT(pi.member_id) as interested_count 
      FROM projects p 
      LEFT JOIN project_interests pi ON p.id = pi.project_id 
      GROUP BY p.id 
      LIMIT $1 OFFSET $2
    \`, [limit, (page - 1) * limit]);
    const count = await query('SELECT COUNT(*) FROM projects');
    return { items: res.rows, total: parseInt(count.rows[0].count), page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM projects WHERE id = $1', [id]);
    return res.rows[0];
  },
  create: async (data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
    const res = await query(\`INSERT INTO projects (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING *\`, vals);
    return res.rows[0];
  },
  update: async (id: string, data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => \`\${k} = $\${i + 1}\`).join(', ');
    vals.push(id);
    const res = await query(\`UPDATE projects SET \${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $\${vals.length} RETURNING *\`, vals);
    return res.rows[0];
  },
  delete: async (id: string) => {
    await query('DELETE FROM projects WHERE id = $1', [id]);
  },
  addInterest: async (memberId: string, projectId: string) => {
    await query('INSERT INTO project_interests (member_id, project_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [memberId, projectId]);
  },
  removeInterest: async (memberId: string, projectId: string) => {
    await query('DELETE FROM project_interests WHERE member_id = $1 AND project_id = $2', [memberId, projectId]);
  }
};
`,
  'courseRepository.ts': `
import { query } from '../db';
export const courseRepo = {
  findAll: async (page = 1, limit = 20) => {
    const res = await query(\`SELECT * FROM courses LIMIT $1 OFFSET $2\`, [limit, (page - 1) * limit]);
    const count = await query('SELECT COUNT(*) FROM courses');
    return { items: res.rows, total: parseInt(count.rows[0].count), page, limit };
  },
  findById: async (id: string) => {
    const res = await query('SELECT * FROM courses WHERE id = $1', [id]);
    return res.rows[0];
  },
  create: async (data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map((_, i) => \`$\${i + 1}\`).join(', ');
    const res = await query(\`INSERT INTO courses (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING *\`, vals);
    return res.rows[0];
  },
  update: async (id: string, data: any) => {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const sets = keys.map((k, i) => \`\${k} = $\${i + 1}\`).join(', ');
    vals.push(id);
    const res = await query(\`UPDATE courses SET \${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = $\${vals.length} RETURNING *\`, vals);
    return res.rows[0];
  },
  delete: async (id: string) => {
    await query('DELETE FROM courses WHERE id = $1', [id]);
  },
  getProgress: async (memberId: string, courseId: string) => {
    const res = await query('SELECT * FROM course_progress WHERE member_id = $1 AND course_id = $2', [memberId, courseId]);
    return res.rows[0];
  }
};
`
};

for (const [name, content] of Object.entries(repos)) {
  fs.writeFileSync(path.join(SRC, 'repositories', name), content.trim());
}

// 3. Services
const services = {
  'authService.ts': `
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, pool } from '../db';
import { authRepo } from '../repositories/authRepository';

export const authService = {
  register: async (data: any) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hash = await bcrypt.hash(data.password, 10);
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [data.email, hash, 'student']
      );
      const user = userRes.rows[0];

      await client.query(
        'INSERT INTO members (user_id, full_name, register_number, department, class_section, year, college_email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [user.id, data.fullName, data.registerNumber, data.department, data.classSection, data.year, data.collegeEmail, data.phone]
      );
      
      await client.query('COMMIT');
      return user;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  login: async (email: string, pass: string) => {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(pass, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
};
`,
  'contentService.ts': `
import { achievementRepo } from '../repositories/achievementRepository';
import { updateRepo } from '../repositories/updateRepository';
import { projectRepo } from '../repositories/projectRepository';
import { courseRepo } from '../repositories/courseRepository';
import { memberRepo } from '../repositories/memberRepository';

export const contentService = {
  getMembers: memberRepo.findAll,
  getMemberById: memberRepo.findById,
  
  getAchievements: achievementRepo.findAll,
  getAchievementById: achievementRepo.findById,
  createAchievement: achievementRepo.create,
  updateAchievement: achievementRepo.update,
  deleteAchievement: achievementRepo.delete,

  getUpdates: updateRepo.findAll,
  getUpdateById: updateRepo.findById,
  createUpdate: updateRepo.create,
  updateUpdate: updateRepo.update,
  deleteUpdate: updateRepo.delete,

  getProjects: projectRepo.findAll,
  getProjectById: projectRepo.findById,
  createProject: projectRepo.create,
  updateProject: projectRepo.update,
  deleteProject: projectRepo.delete,
  addProjectInterest: projectRepo.addInterest,
  removeProjectInterest: projectRepo.removeInterest,

  getCourses: courseRepo.findAll,
  getCourseById: courseRepo.findById,
  createCourse: courseRepo.create,
  updateCourse: courseRepo.update,
  deleteCourse: courseRepo.delete,
  getCourseProgress: courseRepo.getProgress
};
`
};

for (const [name, content] of Object.entries(services)) {
  fs.writeFileSync(path.join(SRC, 'services', name), content.trim());
}

// 4. Controllers
const controllers = {
  'authController.ts': `
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema } from '../validators/schemas';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json({ data: user });
    } catch (err: any) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } });
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      res.json({ data: result });
    } catch (err: any) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }
  },
  me: async (req: any, res: Response) => {
    res.json({ data: req.user });
  },
  logout: async (req: Request, res: Response) => {
    res.json({ data: { success: true } });
  }
};
`,
  'contentController.ts': `
import { Request, Response } from 'express';
import { contentService } from '../services/contentService';
import { achievementSchema, updateSchema, projectSchema, courseSchema } from '../validators/schemas';

const handleCrud = (repo: any, schema: any) => ({
  getAll: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await repo.getAll(page, limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const data = await repo.getById(req.params.id);
      if (!data) return res.status(404).json({ error: { message: 'Not found' } });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const validated = schema.parse(req.body);
      const data = await repo.create(validated);
      res.status(201).json({ data });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const validated = schema.partial().parse(req.body);
      const data = await repo.update(req.params.id, validated);
      res.json({ data });
    } catch (err: any) {
      res.status(400).json({ error: { message: err.message } });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      await repo.delete(req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }
});

export const achievementController = handleCrud({
  getAll: contentService.getAchievements,
  getById: contentService.getAchievementById,
  create: contentService.createAchievement,
  update: contentService.updateAchievement,
  delete: contentService.deleteAchievement
}, achievementSchema);

export const updateController = handleCrud({
  getAll: contentService.getUpdates,
  getById: contentService.getUpdateById,
  create: contentService.createUpdate,
  update: contentService.updateUpdate,
  delete: contentService.deleteUpdate
}, updateSchema);

export const projectController = {
  ...handleCrud({
    getAll: contentService.getProjects,
    getById: contentService.getProjectById,
    create: contentService.createProject,
    update: contentService.updateProject,
    delete: contentService.deleteProject
  }, projectSchema),
  addInterest: async (req: any, res: Response) => {
    try {
      await contentService.addProjectInterest(req.user.id, req.params.id);
      res.status(201).json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  },
  removeInterest: async (req: any, res: Response) => {
    try {
      await contentService.removeProjectInterest(req.user.id, req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }
};

export const courseController = handleCrud({
  getAll: contentService.getCourses,
  getById: contentService.getCourseById,
  create: contentService.createCourse,
  update: contentService.updateCourse,
  delete: contentService.deleteCourse
}, courseSchema);

export const memberController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await contentService.getMembers(req.query.search as string, req.query.department as string, page, limit);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const data = await contentService.getMemberById(req.params.id);
      if (!data) return res.status(404).json({ error: { message: 'Not found' } });
      res.json({ data });
    } catch (err: any) {
      res.status(500).json({ error: { message: err.message } });
    }
  }
};
`
};

for (const [name, content] of Object.entries(controllers)) {
  fs.writeFileSync(path.join(SRC, 'controllers', name), content.trim());
}

// 5. Rewrite Routes to use Controllers
const routes = {
  'authRoutes.ts': `
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
export default router;
`,
  'adminRoutes.ts': `
import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { memberController, achievementController, updateController, projectController, courseController } from '../controllers/contentController';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/members', memberController.getAll);
router.get('/members/:id', memberController.getById);

router.post('/achievements', achievementController.create);
router.put('/achievements/:id', achievementController.update);
router.delete('/achievements/:id', achievementController.delete);

router.post('/updates', updateController.create);
router.put('/updates/:id', updateController.update);
router.delete('/updates/:id', updateController.delete);

router.post('/projects', projectController.create);
router.put('/projects/:id', projectController.update);
router.delete('/projects/:id', projectController.delete);

router.post('/courses', courseController.create);
router.put('/courses/:id', courseController.update);
router.delete('/courses/:id', courseController.delete);

export default router;
`,
  'publicRoutes.ts': `
import { Router } from 'express';
import { achievementController, updateController, projectController, courseController } from '../controllers/contentController';

const router = Router();
router.get('/achievements', achievementController.getAll);
router.get('/achievements/:id', achievementController.getById);
router.get('/updates', updateController.getAll);
router.get('/updates/:id', updateController.getById);
router.get('/projects', projectController.getAll);
router.get('/projects/:id', projectController.getById);
router.get('/courses', courseController.getAll);
router.get('/courses/:id', courseController.getById);
export default router;
`,
  'studentRoutes.ts': `
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { projectController } from '../controllers/contentController';

const router = Router();
router.use(authenticate);

router.post('/projects/:id/interest', projectController.addInterest);
router.delete('/projects/:id/interest', projectController.removeInterest);

export default router;
`
};

for (const [name, content] of Object.entries(routes)) {
  fs.writeFileSync(path.join(SRC, 'routes', name), content.trim());
}

console.log("Scaffolding complete.");
