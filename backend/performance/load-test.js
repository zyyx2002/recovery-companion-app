const autocannon = require('autocannon');
const { exec } = require('child_process');

// 性能测试配置
const config = {
  url: 'http://localhost:3000',
  connections: 10, // 并发连接数
  duration: 30, // 测试持续时间（秒）
  requests: [
    {
      method: 'GET',
      path: '/health'
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    },
    {
      method: 'GET',
      path: '/api/tasks'
    },
    {
      method: 'GET',
      path: '/api/recovery/sessions/current'
    }
  ]
};

// 运行性能测试
async function runLoadTest() {
  console.log('🚀 开始性能测试...');
  console.log(`📊 配置: ${config.connections} 并发连接, ${config.duration} 秒`);
  
  try {
    const result = await autocannon(config);
    
    console.log('\n📈 性能测试结果:');
    console.log(`总请求数: ${result.requests.total}`);
    console.log(`成功请求: ${result.requests.sent}`);
    console.log(`失败请求: ${result.requests.total - result.requests.sent}`);
    console.log(`平均响应时间: ${result.latency.average}ms`);
    console.log(`最小响应时间: ${result.latency.min}ms`);
    console.log(`最大响应时间: ${result.latency.max}ms`);
    console.log(`95% 响应时间: ${result.latency.p95}ms`);
    console.log(`99% 响应时间: ${result.latency.p99}ms`);
    console.log(`吞吐量: ${result.throughput.average} 请求/秒`);
    
    // 性能评估
    if (result.latency.average < 100) {
      console.log('✅ 性能优秀 (平均响应时间 < 100ms)');
    } else if (result.latency.average < 500) {
      console.log('⚠️  性能良好 (平均响应时间 < 500ms)');
    } else {
      console.log('❌ 性能需要优化 (平均响应时间 > 500ms)');
    }
    
    if (result.throughput.average > 1000) {
      console.log('✅ 吞吐量优秀 (> 1000 请求/秒)');
    } else if (result.throughput.average > 100) {
      console.log('⚠️  吞吐量良好 (> 100 请求/秒)');
    } else {
      console.log('❌ 吞吐量需要优化 (< 100 请求/秒)');
    }
    
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
  }
}

// 内存使用监控
function monitorMemory() {
  const used = process.memoryUsage();
  console.log('\n💾 内存使用情况:');
  console.log(`RSS: ${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`);
  console.log(`堆总计: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`);
  console.log(`堆使用: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
  console.log(`外部: ${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`);
}

// 主函数
async function main() {
  console.log('🔧 戒断康复APP性能测试工具');
  console.log('=====================================');
  
  // 检查服务器是否运行
  try {
    const response = await fetch(`${config.url}/health`);
    if (!response.ok) {
      throw new Error('服务器未响应');
    }
    console.log('✅ 服务器运行正常');
  } catch (error) {
    console.error('❌ 无法连接到服务器，请确保服务器正在运行');
    console.log('💡 启动服务器: npm run dev');
    process.exit(1);
  }
  
  // 运行性能测试
  await runLoadTest();
  
  // 显示内存使用情况
  monitorMemory();
  
  console.log('\n🎯 性能优化建议:');
  console.log('1. 启用数据库连接池');
  console.log('2. 添加Redis缓存');
  console.log('3. 使用CDN加速静态资源');
  console.log('4. 启用Gzip压缩');
  console.log('5. 优化数据库查询');
  console.log('6. 添加请求限流');
}

// 运行测试
main().catch(console.error);
