import sql from '@/app/api/utils/sql';

// 获取心情记录
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 1;
    const limit = parseInt(searchParams.get('limit')) || 30;
    
    const moodRecords = await sql`
      SELECT dc.*, rs.addiction_type_id
      FROM daily_checkins dc
      LEFT JOIN recovery_sessions rs ON dc.recovery_session_id = rs.id
      WHERE dc.user_id = ${userId}
      ORDER BY dc.checkin_date DESC
      LIMIT ${limit}
    `;
    
    return Response.json({ moodRecords });
  } catch (error) {
    console.error('Error fetching mood records:', error);
    return Response.json({ error: 'Failed to fetch mood records' }, { status: 500 });
  }
}

// 记录今日心情
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 1, moodRating, notes } = body;
    
    if (!moodRating || moodRating < 1 || moodRating > 5) {
      return Response.json({ error: 'Valid mood rating (1-5) is required' }, { status: 400 });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // 获取用户当前的戒断会话
    const [currentSession] = await sql`
      SELECT id FROM recovery_sessions 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!currentSession) {
      return Response.json({ error: 'No active recovery session found' }, { status: 400 });
    }
    
    // 检查今天是否已经记录过心情
    const [existingCheckin] = await sql`
      SELECT id FROM daily_checkins
      WHERE user_id = ${userId} AND checkin_date = ${today}
    `;
    
    let checkin;
    if (existingCheckin) {
      // 更新今日记录
      [checkin] = await sql`
        UPDATE daily_checkins 
        SET mood_rating = ${moodRating}, notes = ${notes || ''}
        WHERE id = ${existingCheckin.id}
        RETURNING *
      `;
    } else {
      // 创建新记录
      [checkin] = await sql`
        INSERT INTO daily_checkins (user_id, recovery_session_id, checkin_date, mood_rating, notes)
        VALUES (${userId}, ${currentSession.id}, ${today}, ${moodRating}, ${notes || ''})
        RETURNING *
      `;
    }
    
    // 奖励积分
    const pointsEarned = 5;
    await sql`
      UPDATE user_points 
      SET total_points = total_points + ${pointsEarned},
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;
    
    return Response.json({ 
      checkin,
      pointsEarned,
      message: existingCheckin ? '心情记录已更新' : '心情记录成功！获得5积分奖励'
    });
  } catch (error) {
    console.error('Error creating mood checkin:', error);
    return Response.json({ error: 'Failed to create mood checkin' }, { status: 500 });
  }
}