import sql from '@/app/api/utils/sql';

// 完成任务
export async function POST(request) {
  try {
    const body = await request.json();
    const { taskId, userId = 1, completedDate } = body; // 默认用户ID，实际应从认证获取
    
    if (!taskId) {
      return Response.json({ error: 'Task ID is required' }, { status: 400 });
    }
    
    const date = completedDate || new Date().toISOString().split('T')[0];
    
    // 检查任务是否存在
    const [task] = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    
    // 检查是否已经完成过
    const [existing] = await sql`
      SELECT * FROM user_task_completions 
      WHERE user_id = ${userId} AND task_id = ${taskId} AND completed_date = ${date}
    `;
    
    if (existing) {
      return Response.json({ error: 'Task already completed today' }, { status: 409 });
    }
    
    // 使用事务完成任务并更新积分
    const result = await sql.transaction([
      // 记录任务完成
      sql`
        INSERT INTO user_task_completions (user_id, task_id, completed_date, points_earned)
        VALUES (${userId}, ${taskId}, ${date}, ${task.points})
      `,
      // 更新用户积分
      sql`
        INSERT INTO user_points (user_id, total_points, current_level, updated_at)
        VALUES (${userId}, ${task.points}, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          total_points = user_points.total_points + ${task.points},
          current_level = CASE 
            WHEN (user_points.total_points + ${task.points}) >= 500 THEN 5
            WHEN (user_points.total_points + ${task.points}) >= 300 THEN 4
            WHEN (user_points.total_points + ${task.points}) >= 150 THEN 3
            WHEN (user_points.total_points + ${task.points}) >= 50 THEN 2
            ELSE 1
          END,
          updated_at = CURRENT_TIMESTAMP
      `
    ]);
    
    return Response.json({ 
      success: true, 
      pointsEarned: task.points,
      message: `任务完成！获得 ${task.points} 积分`
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return Response.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}