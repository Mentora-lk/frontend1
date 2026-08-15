require('../../Mentora-lk/backend/node_modules/dotenv').config({path: '../../Mentora-lk/backend/.env'});
const db = require('../../Mentora-lk/backend/src/config/db');

async function test() {
  try {
    const res = await db.query(`SELECT pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conname = 'posts_type_check'))`);
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
test();
