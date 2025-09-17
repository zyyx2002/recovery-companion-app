import sql from '@/app/api/utils/sql';

// 获取任务列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const is_daily = searchParams.get('is_daily');
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (category) {
      whereClause += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    if (is_daily !== null) {
      whereClause += ` AND is_daily = $${params.length + 1}`;
      params.push(is_daily === 'true');
    }
    
    const tasks = await sql(
      `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1}`,
      [...params, limit]
    );
    
    return Response.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return Response.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// 创建新任务
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, category, difficulty_level, points, is_daily } = body;
    
    if (!title) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const [task] = await sql`
      INSERT INTO tasks (title, description, category, difficulty_level, points, is_daily)
      VALUES (${title}, ${description || null}, ${category || null}, 
              ${difficulty_level || 1}, ${points || 10}, ${is_daily || false})
      RETURNING *
    `;
    
    return Response.json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    return Response.json({ error: 'Failed to create task' }, { status: 500 });
  }
}