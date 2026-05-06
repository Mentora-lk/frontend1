const { Client } = require('C:/Users/KCC/Documents/GitHub/backend/node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_tIa5UxNYu0Rf@ep-odd-bar-ai460n04-pooler.c-4.us-east-1.aws.neon.tech/Mentora?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();
  try {
    const studentId = 1;
    const communityId = 101; 
    const query = `
      SELECT
         p.id,
         p.type,
         p.content,
         p.media_url,
         p.is_pinned,
         p.created_at,
         p.author_id,
         COALESCE(tp.full_name, sp.full_name, 'Unknown') AS author_name,
         tp.profile_picture_url AS author_avatar,
         CASE WHEN tp.user_id IS NOT NULL THEN 'Tutor' ELSE 'Student' END AS role,
         (SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.id) AS reaction_count,
         EXISTS (
           SELECT 1 FROM post_reactions pr
           WHERE pr.post_id = p.id AND pr.student_id = $1
         ) AS has_reacted
       FROM posts p
       LEFT JOIN tutor_profiles tp ON tp.user_id = p.author_id
       LEFT JOIN student_profiles sp ON sp.user_id = p.author_id
       WHERE p.community_id = $2
       ORDER BY p.is_pinned DESC, p.created_at DESC
    `;
    const res = await client.query(query, [studentId, communityId]);
    console.log("Success:", res.rows);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await client.end();
  }
}
run();
