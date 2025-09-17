import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import taskRoutes from './routes/tasks';
import recoveryRoutes from './routes/recovery';
import communityRoutes from './routes/community';
import achievementRoutes from './routes/achievements';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

// 导入中间件
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// 导入数据库
import { initializeDatabase } from './database/connection';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(compression());

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true,
}));

// 请求日志
app.use(morgan('combined'));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15分钟'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// 404处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ 数据库初始化失败，服务器启动中止');
      process.exit(1);
    }

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📱 API文档: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer();
