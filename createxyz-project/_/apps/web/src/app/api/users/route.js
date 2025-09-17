import sql from '@/app/api/utils/sql';

// 获取用户列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;
    
    const users = await sql`
      SELECT u.*, 
             up.total_points, 
             up.current_level,
             COUNT(rs.id) as active_sessions,
             MAX(rs.current_streak) as max_streak
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      LEFT JOIN recovery_sessions rs ON u.id = rs.user_id AND rs.is_active = true
      GROUP BY u.id, up.total_points, up.current_level
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return Response.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// 创建新用户
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, avatar_url } = body;
    
    if (!username || !email) {
      return Response.json({ error: 'Username and email are required' }, { status: 400 });
    }
    
    const [user] = await sql`
      INSERT INTO users (username, email, avatar_url)
      VALUES (${username}, ${email}, ${avatar_url || null})
      RETURNING *
    `;
    
    // 创建用户积分记录
    await sql`
      INSERT INTO user_points (user_id, total_points, current_level)
      VALUES (${user.id}, 0, 1)
    `;
    
    return Response.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('duplicate')) {
      return Response.json({ error: 'Username or email already exists' }, { status: 409 });
    }
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}