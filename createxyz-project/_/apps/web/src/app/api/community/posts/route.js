import sql from '@/app/api/utils/sql';

// 获取社区帖子列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (category) {
      whereClause += ` AND cp.category = $${params.length + 1}`;
      params.push(category);
    }
    
    const posts = await sql(
      `SELECT cp.*, 
              u.username as author,
              u.avatar_url,
              COALESCE(rs.current_streak, 0) as streak
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.id
       LEFT JOIN recovery_sessions rs ON u.id = rs.user_id AND rs.is_active = true
       ${whereClause}
       ORDER BY cp.created_at DESC 
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    
    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// 创建新帖子
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, category, userId = 1 } = body; // 默认用户ID，实际应从认证获取
    
    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const [post] = await sql`
      INSERT INTO community_posts (user_id, title, content, category)
      VALUES (${userId}, ${title || null}, ${content}, ${category || null})
      RETURNING *
    `;
    
    return Response.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return Response.json({ error: 'Failed to create post' }, { status: 500 });
  }
}