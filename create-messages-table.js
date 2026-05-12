/**
 * Run this from the BACKEND directory:
 *   node ../frontend1/create-messages-table.js
 *
 * Or copy it to the backend folder and run:
 *   node create-messages-table.js
 */
const db = require('./src/config/db') || require('../backend/src/config/db');

async function createMessagesTable() {
  try {
    console.log('Creating messages table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id          SERIAL PRIMARY KEY,
        sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content     TEXT NOT NULL,
        is_read     BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created   ON messages(created_at DESC);
    `);
    console.log('✅ messages table created successfully.');
  } catch (error) {
    console.error('❌ Error creating messages table:', error.message);
  } finally {
    process.exit();
  }
}

createMessagesTable();
