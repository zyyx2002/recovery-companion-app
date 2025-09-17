import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { db } from '../database/connection';

// 测试数据库连接
beforeAll(async () => {
  try {
    // 检查数据库连接
    await db.execute('SELECT 1');
    console.log('✅ 测试数据库连接成功');
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error);
    throw error;
  }
});

// 清理测试数据
beforeEach(async () => {
  // 这里可以添加每个测试前的清理逻辑
  // 注意：实际的清理逻辑应该在各个测试文件中处理
});

// 测试结束后清理
afterAll(async () => {
  // 这里可以添加测试结束后的清理逻辑
  console.log('🧹 测试完成，清理资源');
});
