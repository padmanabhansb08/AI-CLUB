import { pool } from '../index';
import bcrypt from 'bcrypt';

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping development seed in production environment.');
    process.exit(0);
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if admin exists
    const adminRes = await client.query('SELECT id FROM users WHERE email = $1', ['admin@college.edu']);
    let adminId;
    if (adminRes.rowCount === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      const res = await client.query(`
        INSERT INTO users (email, password_hash, role)
        VALUES ('admin@college.edu', $1, 'admin') RETURNING id
      `, [hash]);
      adminId = res.rows[0].id;
    } else {
      adminId = adminRes.rows[0].id;
    }

    // Add student
    const studentRes = await client.query('SELECT id FROM users WHERE email = $1', ['student@college.edu']);
    let studentId, memberId;
    if (studentRes.rowCount === 0) {
      const hash = await bcrypt.hash('student123', 10);
      const res = await client.query(`
        INSERT INTO users (email, password_hash, role)
        VALUES ('student@college.edu', $1, 'student') RETURNING id
      `, [hash]);
      studentId = res.rows[0].id;

      const memRes = await client.query(`
        INSERT INTO members (user_id, full_name, register_number, department, class_section, year, college_email, phone, status)
        VALUES ($1, 'John Doe', 'REG12345', 'Computer Science', 'A', 2026, 'student@college.edu', '1234567890', 'Active') RETURNING id
      `, [studentId]);
      memberId = memRes.rows[0].id;
    }

    // Achievements
    const achRes = await client.query(`
      INSERT INTO achievements (title, description, category, student_name, event_name, date, featured)
      VALUES ('First Place Hackathon', 'Won first place in the national hackathon', 'Hackathons', 'John Doe', 'National Hack', '2026-05-15', true)
      RETURNING id
    `);
    
    // Updates
    await client.query(`
      INSERT INTO updates (title, summary, category, source, published_at, read_time, content, featured)
      VALUES ('AI Breakthrough', 'A new AI model was released', 'AI News', 'TechBlog', '2026-06-01', '5 min read', '<p>Full content here</p>', true)
    `);

    // Projects
    const projRes = await client.query(`
      INSERT INTO projects (title, short_description, category, difficulty, status, featured)
      VALUES ('AI Chatbot', 'A smart chatbot', 'NLP', 'Intermediate', 'Open', true)
      RETURNING id
    `);
    const projectId = projRes.rows[0].id;

    if (memberId) {
        // Project Interests
        await client.query(`
        INSERT INTO project_interests (member_id, project_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [memberId, projectId]);
    }

    // Courses
    const courseRes = await client.query(`
      INSERT INTO courses (title, provider, description, category, difficulty, tracking_method, tracking_status, featured)
      VALUES ('Intro to Machine Learning', 'Coursera', 'Learn ML basics', 'Machine Learning', 'Beginner', 'api', 'Integration Available', true)
      RETURNING id
    `);
    const courseId = courseRes.rows[0].id;

    if (memberId) {
        // Course Progress (with NULL progressPercent)
        await client.query(`
        INSERT INTO course_progress (course_id, member_id, status, progress_percent, tracking_method)
        VALUES ($1, $2, 'Enrolled', NULL, 'api') ON CONFLICT DO NOTHING
        `, [courseId, memberId]);
    }

    console.log('Seed completed successfully');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
