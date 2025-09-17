import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// 数据库连接配置
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// 数据库健康检查
export async function checkDatabaseConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 数据库初始化
export async function initializeDatabase() {
  try {
    // 检查连接
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('数据库连接失败');
    }

    // 运行迁移（如果需要）
    // await runMigrations();
    
    console.log('✅ 数据库初始化完成');
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    return false;
  }
}
