const {Pool} = require('pg');
const p = new Pool({user: 'aiclub', password: 'password', host: 'localhost', port: 5433, database: 'aiclub_db'});
p.query('INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)', ['a8917e76-3510-4497-b2e1-455b80a158b4', 'superadmin@college.edu', '$2b$10$5FCH1anVs7wiWp2fhngVy.njITrtCxyEXMM1wEbYlwxOve46Vi6lO', 'admin']).then(() => {
    console.log("Done");
    process.exit(0);
}).catch(console.error);
