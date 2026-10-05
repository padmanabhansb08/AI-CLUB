import { pool } from '../index';
import bcrypt from 'bcrypt';

export async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.log('[seed] Skipping development seed in production environment.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Admin User (admin@aiclub.com)
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminRes = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('admin@aiclub.com', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
      RETURNING id
    `, [adminPasswordHash]);
    const adminId = adminRes.rows[0].id;

    // Optional legacy alias
    await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('admin@college.edu', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
    `, [adminPasswordHash]);

    // 2. Student User (student@aiclub.com)
    const studentPasswordHash = await bcrypt.hash('student123', 10);
    const studentRes = await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('student@aiclub.com', $1, 'student')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'student'
      RETURNING id
    `, [studentPasswordHash]);
    const studentId = studentRes.rows[0].id;

    // Optional legacy alias
    await client.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('student@college.edu', $1, 'student')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'student'
    `, [studentPasswordHash]);

    // 3. Member Profile for student@aiclub.com
    const memberRes = await client.query(`
      INSERT INTO members (
        user_id, full_name, register_number, department, class_section, year, 
        college_email, phone, status, bio, skills, technical_interests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (register_number) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        department = EXCLUDED.department,
        class_section = EXCLUDED.class_section,
        year = EXCLUDED.year,
        college_email = EXCLUDED.college_email,
        phone = EXCLUDED.phone,
        bio = EXCLUDED.bio,
        skills = EXCLUDED.skills,
        technical_interests = EXCLUDED.technical_interests
      RETURNING id
    `, [
      studentId,
      'Rahul Sharma',
      '21BCE1001',
      'CSE',
      'A',
      3,
      'student@aiclub.com',
      '+91 9876543210',
      'Active',
      'AI enthusiast & Full Stack Developer passionate about Machine Learning, NLP, and modern web systems.',
      ['Python', 'PyTorch', 'TypeScript', 'React', 'PostgreSQL'],
      ['Deep Learning', 'Computer Vision', 'Generative AI']
    ]);
    const memberId = memberRes.rows[0].id;

    // 4. Sample Achievements
    const achCount = await client.query('SELECT COUNT(*) as cnt FROM achievements');
    if (parseInt(achCount.rows[0].cnt) === 0) {
      await client.query(`
        INSERT INTO achievements (title, description, category, student_name, event_name, date, year, featured)
        VALUES 
          ('First Place — National AI Hackathon', 'Won first place for developing an automated medical imaging diagnostic tool.', 'Hackathons', 'Rahul Sharma', 'National AI Challenge 2026', '2026-03-15', 3, true),
          ('Best Research Paper Award', 'Published a novel benchmark on small language models on edge devices.', 'Research', 'Ananya Patel', 'IEEE Student Symposium', '2026-02-10', 4, true)
      `);
    }

    // 5. Sample Tech Updates
    const updCount = await client.query('SELECT COUNT(*) as cnt FROM updates');
    if (parseInt(updCount.rows[0].cnt) === 0) {
      await client.query(`
        INSERT INTO updates (title, summary, category, source, published_at, read_time, content, featured)
        VALUES 
          ('Gemini & Reasoning Models Deep Dive', 'Exploring multi-turn chain-of-thought architecture in modern production workloads.', 'AI News', 'AI Club Tech Team', '2026-09-20', '6 min read', '<p>A comprehensive review of modern reasoning benchmarks.</p>', true),
          ('Open-Source LLMs for Real-time Edge Deployment', 'How quantization techniques allow 8B models to run on mobile hardware with minimal degradation.', 'Engineering', 'AI Club Research Lab', '2026-09-28', '4 min read', '<p>Quantization techniques overview and implementation.</p>', false)
      `);
    }

    // 6. Sample Projects
    const projRes = await client.query(`
      INSERT INTO projects (title, short_description, overview, problem, approach, category, difficulty, status, expected_outcome, featured)
      VALUES (
        'Autonomous Quadcopter Vision Pipeline',
        'Real-time obstacle avoidance and path planning using onboard cameras and edge neural networks.',
        'This project creates a lightweight vision-based navigation system for autonomous drones in indoor environments without GPS.',
        'Indoor navigation suffers when GPS signals are unavailable.',
        'We employ lightweight YOLOv8 models quantized for TensorRT running on NVIDIA Jetson.',
        'Computer Vision',
        'Advanced',
        'Active',
        'A working drone prototype navigating a 50-meter indoor obstacle course autonomously.',
        true
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    if (projRes.rowCount && projRes.rowCount > 0) {
      const projectId = projRes.rows[0].id;
      await client.query(`
        INSERT INTO project_interests (member_id, project_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [memberId, projectId]);
    }

    // 7. Sample Courses
    const courseRes = await client.query(`
      INSERT INTO courses (title, provider, description, category, difficulty, duration, course_url, tracking_method, tracking_status, featured)
      VALUES (
        'Deep Learning Specialization',
        'DeepLearning.AI',
        'Master the fundamentals of neural networks, CNNs, RNNs, Transformers, and modern training dynamics.',
        'Deep Learning',
        'Intermediate',
        '3 months',
        'https://coursera.org',
        'manual',
        'Active',
        true
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    if (courseRes.rowCount && courseRes.rowCount > 0) {
      const courseId = courseRes.rows[0].id;
      await client.query(`
        INSERT INTO course_progress (course_id, member_id, status, progress_percent, tracking_method)
        VALUES ($1, $2, 'In Progress', 45, 'manual')
        ON CONFLICT DO NOTHING
      `, [courseId, memberId]);
    }

    // 8. Sample Announcements
    const annCount = await client.query('SELECT COUNT(*) as cnt FROM announcements');
    if (parseInt(annCount.rows[0].cnt) === 0) {
      await client.query(`
        INSERT INTO announcements (title, body, category, priority, status, published_at, created_by)
        VALUES (
          'Welcome to AI CLUB 2026-2027!',
          'We are excited to kick off Sprint 1 of our community platform. Check out ongoing projects, explore courses, and collaborate with peer members.',
          'general',
          'important',
          'published',
          NOW(),
          $1
        )
      `, [adminId]);
    }

    await client.query('COMMIT');
    console.log('[seed] ✓ Seed completed successfully with development accounts.');
    console.log('[seed]   - Admin:   admin@aiclub.com   (password: admin123)');
    console.log('[seed]   - Student: student@aiclub.com (password: student123)');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[seed] ✗ Seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module || process.argv[1]?.endsWith('001_initial_seed.ts')) {
  seed()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[seed] Failed:', err);
      await pool.end();
      process.exit(1);
    });
}
