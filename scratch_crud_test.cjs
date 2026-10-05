const http = require('http');

const API_BASE = 'http://localhost:3000/api';
let adminToken = '';

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (adminToken) {
      opts.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    const req = http.request(`${API_BASE}${path}`, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = data ? JSON.parse(data) : {}; } catch(e){}
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testCRUD() {
  console.log('--- Admin Content CRUD Audit ---');

  // 1. Login to get token
  const loginRes = await request('POST', '/auth/login', { email: 'admin@college.edu', password: 'admin123' });
  if (loginRes.status !== 200 || !loginRes.data.data.token) {
    console.error('Failed to get admin token', loginRes);
    process.exit(1);
  }
  adminToken = loginRes.data.data.token;
  console.log('✅ Admin Login');

  const resources = [
    {
      name: 'Achievement',
      path: '/achievements',
      createPayload: { title: 'Test Ach', description: 'Desc', category: 'Hackathons', student_name: 'Test', date: '2026-01-01', featured: false },
      updatePayload: { title: 'Updated Test Ach' }
    },
    {
      name: 'Update',
      path: '/updates',
      createPayload: { title: 'Test Update', summary: 'Sum', category: 'News', source: 'Src', published_at: '2026-01-01', featured: false },
      updatePayload: { title: 'Updated Test Update' }
    },
    {
      name: 'Project',
      path: '/projects',
      createPayload: { title: 'Test Proj', short_description: 'Short', category: 'AI', difficulty: 'Beginner', status: 'Open', featured: false },
      updatePayload: { title: 'Updated Test Proj' }
    },
    {
      name: 'Course',
      path: '/courses',
      createPayload: { title: 'Test Course', provider: 'Prov', description: 'Desc', category: 'AI', difficulty: 'Beginner', tracking_method: 'api', tracking_status: 'Integration Available', featured: false },
      updatePayload: { title: 'Updated Test Course' }
    }
  ];

  let allPassed = true;

  for (const res of resources) {
    try {
      console.log(`\nTesting ${res.name}...`);
      
      // CREATE
      const createRes = await request('POST', `/admin${res.path}`, res.createPayload);
      if (createRes.status !== 201) throw new Error(`CREATE failed: ${JSON.stringify(createRes)}`);
      const createdId = createRes.data.data.id;
      console.log(`  CREATE: OK (${createdId})`);

      // READ (Get By Id)
      const readRes = await request('GET', `${res.path}/${createdId}`);
      if (readRes.status !== 200 || readRes.data.data.title !== res.createPayload.title) throw new Error(`READ failed: ${JSON.stringify(readRes)}`);
      console.log(`  READ: OK`);

      // UPDATE
      const updateRes = await request('PUT', `/admin${res.path}/${createdId}`, res.updatePayload);
      if (updateRes.status !== 200 || updateRes.data.data.title !== res.updatePayload.title) throw new Error(`UPDATE failed: ${JSON.stringify(updateRes)}`);
      console.log(`  UPDATE: OK`);

      // DELETE
      const delRes = await request('DELETE', `/admin${res.path}/${createdId}`);
      if (delRes.status !== 204) throw new Error(`DELETE failed: ${JSON.stringify(delRes)}`);
      console.log(`  DELETE: OK`);

      // READ (Verify Deletion)
      const readAfterDel = await request('GET', `${res.path}/${createdId}`);
      if (readAfterDel.status !== 404) throw new Error(`Verify DELETE failed: ${JSON.stringify(readAfterDel)}`);
      console.log(`  VERIFY DELETED: OK`);

    } catch (e) {
      console.error(`❌ ${res.name} test failed:`, e.message);
      allPassed = false;
    }
  }

  if (allPassed) console.log('\n✅ ALL CRUD TESTS PASSED');
  else console.log('\n❌ SOME CRUD TESTS FAILED');
}

testCRUD();
