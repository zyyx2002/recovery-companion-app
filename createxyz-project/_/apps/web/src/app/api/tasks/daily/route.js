import sql from '@/app/api/utils/sql';

// 获取今日任务（移动端使用）
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 1; // 默认用户ID，实际应从认证获取
    const today = new Date().toISOString().split('T')[0];
    
    // 获取今日任务和完成状态
    const tasks = await sql`
      SELECT t.*, 
             CASE WHEN utc.id IS NOT NULL THEN true ELSE false END as completed
      FROM tasks t
      LEFT JOIN user_task_completions utc ON t.id = utc.task_id 
        AND utc.user_id = ${userId} 
        AND utc.completed_date = ${today}
      WHERE t.is_daily = true
      ORDER BY t.difficulty_level, t.points DESC
    `;
    
    return Response.json(tasks);
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    return Response.json({ error: 'Failed to fetch daily tasks' }, { status: 500 });
  }
}