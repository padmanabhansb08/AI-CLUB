const {Pool} = require('pg');
const p = new Pool({user: 'aiclub', password: 'password', host: 'localhost', port: 5433, database: 'aiclub_db'});
p.query('UPDATE users SET password_hash = $1 WHERE email = $2', ['$2b$10$5FCH1anVs7wiWp2fhngVy.njITrtCxyEXMM1wEbYlwxOve46Vi6lO', 'admin@college.edu']).then(() => {
    console.log("Done");
    process.exit(0);
});
