import sql from '@/app/api/utils/sql';

// 获取用户统计信息（移动端使用）
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 1; // 默认用户ID，实际应从认证获取
    
    // 获取用户基本信息和积分
    const [userStats] = await sql`
      SELECT u.username, u.email, u.avatar_url,
             up.total_points, up.current_level,
             rs.current_streak, rs.longest_streak,
             at.name as addiction_name
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      LEFT JOIN recovery_sessions rs ON u.id = rs.user_id AND rs.is_active = true
      LEFT JOIN addiction_types at ON rs.addiction_type_id = at.id
      WHERE u.id = ${userId}
    `;
    
    if (!userStats) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 获取今日完成任务数
    const today = new Date().toISOString().split('T')[0];
    const [todayTasksCount] = await sql`
      SELECT COUNT(*) as completed_today
      FROM user_task_completions 
      WHERE user_id = ${userId} AND completed_date = ${today}
    `;
    
    return Response.json({
      username: userStats.username,
      email: userStats.email,
      avatar_url: userStats.avatar_url,
      totalPoints: userStats.total_points || 0,
      level: userStats.current_level || 1,
      currentStreak: userStats.current_streak || 0,
      longestStreak: userStats.longest_streak || 0,
      currentAddiction: userStats.addiction_name ? { name: userStats.addiction_name } : null,
      completedTodayTasks: parseInt(todayTasksCount.completed_today)
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return Response.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}