import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// AI聊天请求验证schema
const chatRequestSchema = z.object({
  message: z.string().min(1, '消息不能为空').max(1000, '消息过长'),
  context: z.object({
    currentStreak: z.number().optional(),
    addictionType: z.string().optional(),
    mood: z.string().optional()
  }).optional()
});

// AI聊天响应类型
interface ChatResponse {
  message: string;
  suggestions: string[];
  encouragement: string;
  timestamp: string;
}

// 模拟AI响应（实际项目中应该调用OpenAI API）
const generateAIResponse = async (userMessage: string, context?: any): Promise<ChatResponse> => {
  // 这里应该调用真实的AI API，比如OpenAI GPT
  // 现在使用模拟响应
  
  const responses = {
    greeting: [
      "你好！我是你的戒断康复助手，很高兴为你提供支持。",
      "欢迎回来！我在这里陪伴你的戒断之旅。",
      "你好！今天感觉怎么样？有什么需要帮助的吗？"
    ],
    encouragement: [
      "你已经做得很棒了！每一步都是进步。",
      "坚持下去，你比想象中更强大！",
      "戒断路上虽然困难，但你并不孤单。",
      "每一次坚持都是对自己的投资。"
    ],
    advice: [
      "建议你尝试深呼吸练习来缓解焦虑。",
      "可以尝试转移注意力，比如运动或阅读。",
      "记住，戒断是一个过程，不要对自己太苛刻。",
      "建立新的健康习惯来替代旧的习惯。"
    ],
    support: [
      "我理解你的感受，戒断确实不容易。",
      "你并不孤单，很多人都在经历同样的挑战。",
      "寻求帮助是勇敢的表现，不是软弱。",
      "每一次尝试都值得被认可。"
    ]
  };

  const suggestions = [
    "尝试深呼吸练习",
    "进行10分钟冥想",
    "写一篇心情日记",
    "听一首舒缓的音乐",
    "做简单的伸展运动"
  ];

  let response = "";
  let category = "general";

  // 简单的关键词匹配
  if (userMessage.includes("你好") || userMessage.includes("hi") || userMessage.includes("hello")) {
    response = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    category = "greeting";
  } else if (userMessage.includes("困难") || userMessage.includes("坚持") || userMessage.includes("累")) {
    response = responses.encouragement[Math.floor(Math.random() * responses.encouragement.length)];
    category = "encouragement";
  } else if (userMessage.includes("建议") || userMessage.includes("怎么办") || userMessage.includes("帮助")) {
    response = responses.advice[Math.floor(Math.random() * responses.advice.length)];
    category = "advice";
  } else if (userMessage.includes("难过") || userMessage.includes("沮丧") || userMessage.includes("想放弃")) {
    response = responses.support[Math.floor(Math.random() * responses.support.length)];
    category = "support";
  } else {
    response = responses.encouragement[Math.floor(Math.random() * responses.encouragement.length)];
  }

  // 根据上下文调整响应
  if (context?.currentStreak) {
    if (context.currentStreak >= 30) {
      response += " 你已经坚持了" + context.currentStreak + "天，这真的很了不起！";
    } else if (context.currentStreak >= 7) {
      response += " 你已经坚持了" + context.currentStreak + "天，继续加油！";
    }
  }

  return {
    message: response,
    suggestions: suggestions.slice(0, 3),
    encouragement: responses.encouragement[Math.floor(Math.random() * responses.encouragement.length)],
    timestamp: new Date().toISOString()
  };
};

// AI聊天接口
router.post('/chat', authenticateToken, asyncHandler(async (req, res) => {
  const { message, context } = chatRequestSchema.parse(req.body);
  
  try {
    const aiResponse = await generateAIResponse(message, context);
    
    res.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('AI聊天错误:', error);
    throw createError.internal('AI服务暂时不可用，请稍后再试');
  }
}));

// 获取AI建议
router.get('/suggestions', authenticateToken, asyncHandler(async (req, res) => {
  const { type = 'general' } = req.query;
  
  const suggestions = {
    general: [
      "进行5分钟深呼吸练习",
      "写一篇心情日记",
      "听一首舒缓的音乐",
      "做简单的伸展运动",
      "给朋友发个消息"
    ],
    stress: [
      "尝试4-7-8呼吸法",
      "进行渐进式肌肉放松",
      "听自然声音",
      "进行正念冥想",
      "喝一杯温水"
    ],
    motivation: [
      "回顾你的戒断目标",
      "想象戒断成功后的美好生活",
      "阅读励志文章",
      "与支持你的人交流",
      "设定小目标并庆祝"
    ],
    social: [
      "加入戒断支持群组",
      "分享你的经历",
      "帮助其他戒断者",
      "参加线下活动",
      "寻找戒断伙伴"
    ]
  };

  const typeSuggestions = suggestions[type as keyof typeof suggestions] || suggestions.general;
  
  res.json({
    success: true,
    data: {
      suggestions: typeSuggestions,
      type: type
    }
  });
}));

// 获取每日激励
router.get('/daily-motivation', authenticateToken, asyncHandler(async (req, res) => {
  const motivations = [
    "每一天的坚持都是向自由迈进的一步。",
    "你比想象中更强大，比困难更坚韧。",
    "戒断不是放弃，而是选择更好的自己。",
    "每一次拒绝诱惑，都是对未来的投资。",
    "困难是成长的阶梯，坚持是成功的钥匙。",
    "你的决心比任何诱惑都更强大。",
    "每一天都是新的开始，每一刻都是新的机会。",
    "戒断路上，你并不孤单，我们与你同在。"
  ];

  const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
  
  res.json({
    success: true,
    data: {
      motivation: randomMotivation,
      date: new Date().toISOString().split('T')[0]
    }
  });
}));

// 情绪分析（模拟）
router.post('/mood-analysis', authenticateToken, asyncHandler(async (req, res) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    throw createError.badRequest('请提供要分析的文本');
  }

  // 简单的情绪分析（实际项目中应该使用专业的NLP服务）
  const positiveWords = ['开心', '快乐', '满足', '兴奋', '感激', '平静', '放松', '自信'];
  const negativeWords = ['难过', '沮丧', '焦虑', '紧张', '愤怒', '失望', '孤独', '疲惫'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });

  let mood = 'neutral';
  let confidence = 0.5;
  
  if (positiveCount > negativeCount) {
    mood = 'positive';
    confidence = Math.min(0.8, 0.5 + (positiveCount - negativeCount) * 0.1);
  } else if (negativeCount > positiveCount) {
    mood = 'negative';
    confidence = Math.min(0.8, 0.5 + (negativeCount - positiveCount) * 0.1);
  }

  const recommendations = {
    positive: [
      "继续保持这种积极的心态！",
      "可以分享你的好心情给其他人。",
      "记录下今天让你开心的事情。"
    ],
    negative: [
      "尝试深呼吸来缓解情绪。",
      "可以尝试一些放松的活动。",
      "记住，情绪是暂时的，你会好起来的。"
    ],
    neutral: [
      "保持平衡的心态很好。",
      "可以尝试一些新的活动。",
      "关注当下的感受。"
    ]
  };

  res.json({
    success: true,
    data: {
      mood: mood,
      confidence: confidence,
      recommendations: recommendations[mood as keyof typeof recommendations]
    }
  });
}));

export default router;
