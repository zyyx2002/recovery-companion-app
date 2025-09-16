import express from 'express';
import { z } from 'zod';
import { db } from '../database/connection';
import { communityPosts, communityComments, likes, users } from '../database/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// 创建帖子验证schema
const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题过长').optional(),
  content: z.string().min(1, '内容不能为空').max(2000, '内容过长'),
  category: z.string().min(1, '分类不能为空').max(50, '分类过长'),
  isAnonymous: z.boolean().default(false)
});

// 创建评论验证schema
const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(500, '评论过长'),
  parentId: z.number().int().positive().optional()
});

// 获取帖子列表
router.get('/posts', optionalAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, sort = 'newest' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = db
    .select({
      id: communityPosts.id,
      title: communityPosts.title,
      content: communityPosts.content,
      category: communityPosts.category,
      isAnonymous: communityPosts.isAnonymous,
      likesCount: communityPosts.likesCount,
      commentsCount: communityPosts.commentsCount,
      createdAt: communityPosts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl
      }
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.isApproved, true));

  // 分类过滤
  if (category) {
    query = query.where(eq(communityPosts.category, category as string));
  }

  // 排序
  if (sort === 'popular') {
    query = query.orderBy(desc(communityPosts.likesCount), desc(communityPosts.createdAt));
  } else {
    query = query.orderBy(desc(communityPosts.createdAt));
  }

  const posts = await query
    .limit(Number(limit))
    .offset(offset);

  // 处理匿名用户
  const processedPosts = posts.map(post => ({
    ...post,
    user: post.isAnonymous ? {
      id: null,
      username: '匿名用户',
      avatarUrl: null
    } : post.user
  }));

  res.json({
    posts: processedPosts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: processedPosts.length
    }
  });
}));

// 创建帖子
router.post('/posts', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { title, content, category, isAnonymous } = createPostSchema.parse(req.body);

  const [newPost] = await db
    .insert(communityPosts)
    .values({
      userId,
      title: title || null,
      content,
      category,
      isAnonymous,
      likesCount: 0,
      commentsCount: 0,
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning({
      id: communityPosts.id,
      title: communityPosts.title,
      content: communityPosts.content,
      category: communityPosts.category,
      isAnonymous: communityPosts.isAnonymous,
      createdAt: communityPosts.createdAt
    });

  res.status(201).json({
    message: '帖子发布成功',
    post: newPost
  });
}));

// 获取帖子详情
router.get('/posts/:id', optionalAuth, asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id);
  
  if (isNaN(postId)) {
    throw createError.badRequest('无效的帖子ID');
  }

  const [post] = await db
    .select({
      id: communityPosts.id,
      title: communityPosts.title,
      content: communityPosts.content,
      category: communityPosts.category,
      isAnonymous: communityPosts.isAnonymous,
      likesCount: communityPosts.likesCount,
      commentsCount: communityPosts.commentsCount,
      createdAt: communityPosts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl
      }
    })
    .from(communityPosts)
    .leftJoin(users, eq(communityPosts.userId, users.id))
    .where(and(
      eq(communityPosts.id, postId),
      eq(communityPosts.isApproved, true)
    ))
    .limit(1);

  if (!post) {
    throw createError.notFound('帖子不存在');
  }

  // 处理匿名用户
  const processedPost = {
    ...post,
    user: post.isAnonymous ? {
      id: null,
      username: '匿名用户',
      avatarUrl: null
    } : post.user
  };

  res.json({
    post: processedPost
  });
}));

// 获取帖子评论
router.get('/posts/:id/comments', optionalAuth, asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id);
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  if (isNaN(postId)) {
    throw createError.badRequest('无效的帖子ID');
  }

  const comments = await db
    .select({
      id: communityComments.id,
      content: communityComments.content,
      parentId: communityComments.parentId,
      likesCount: communityComments.likesCount,
      createdAt: communityComments.createdAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl
      }
    })
    .from(communityComments)
    .leftJoin(users, eq(communityComments.userId, users.id))
    .where(and(
      eq(communityComments.postId, postId),
      eq(communityComments.isApproved, true)
    ))
    .orderBy(desc(communityComments.createdAt))
    .limit(Number(limit))
    .offset(offset);

  res.json({
    comments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: comments.length
    }
  });
}));

// 创建评论
router.post('/posts/:id/comments', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const postId = parseInt(req.params.id);
  const { content, parentId } = createCommentSchema.parse(req.body);

  if (isNaN(postId)) {
    throw createError.badRequest('无效的帖子ID');
  }

  // 检查帖子是否存在
  const [post] = await db
    .select({ id: communityPosts.id })
    .from(communityPosts)
    .where(and(
      eq(communityPosts.id, postId),
      eq(communityPosts.isApproved, true)
    ))
    .limit(1);

  if (!post) {
    throw createError.notFound('帖子不存在');
  }

  // 如果指定了父评论，检查父评论是否存在
  if (parentId) {
    const [parentComment] = await db
      .select({ id: communityComments.id })
      .from(communityComments)
      .where(and(
        eq(communityComments.id, parentId),
        eq(communityComments.postId, postId)
      ))
      .limit(1);

    if (!parentComment) {
      throw createError.notFound('父评论不存在');
    }
  }

  const [newComment] = await db
    .insert(communityComments)
    .values({
      postId,
      userId,
      content,
      parentId: parentId || null,
      likesCount: 0,
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning({
      id: communityComments.id,
      content: communityComments.content,
      parentId: communityComments.parentId,
      createdAt: communityComments.createdAt
    });

  // 更新帖子的评论数
  await db
    .update(communityPosts)
    .set({
      commentsCount: sql`${communityPosts.commentsCount} + 1`,
      updatedAt: new Date()
    })
    .where(eq(communityPosts.id, postId));

  res.status(201).json({
    message: '评论发布成功',
    comment: newComment
  });
}));

// 点赞/取消点赞
router.post('/posts/:id/like', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    throw createError.badRequest('无效的帖子ID');
  }

  // 检查帖子是否存在
  const [post] = await db
    .select({ id: communityPosts.id, likesCount: communityPosts.likesCount })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);

  if (!post) {
    throw createError.notFound('帖子不存在');
  }

  // 检查是否已经点赞
  const [existingLike] = await db
    .select({ id: likes.id })
    .from(likes)
    .where(and(
      eq(likes.userId, userId),
      eq(likes.targetType, 'post'),
      eq(likes.targetId, postId)
    ))
    .limit(1);

  if (existingLike) {
    // 取消点赞
    await db
      .delete(likes)
      .where(eq(likes.id, existingLike.id));

    await db
      .update(communityPosts)
      .set({
        likesCount: sql`${communityPosts.likesCount} - 1`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));

    res.json({
      message: '取消点赞成功',
      liked: false,
      likesCount: post.likesCount - 1
    });
  } else {
    // 添加点赞
    await db
      .insert(likes)
      .values({
        userId,
        targetType: 'post',
        targetId: postId,
        createdAt: new Date()
      });

    await db
      .update(communityPosts)
      .set({
        likesCount: sql`${communityPosts.likesCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));

    res.json({
      message: '点赞成功',
      liked: true,
      likesCount: post.likesCount + 1
    });
  }
}));

// 获取分类列表
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [
    { name: '经验分享', description: '分享戒断经验和心得' },
    { name: '求助', description: '寻求帮助和支持' },
    { name: '心情', description: '记录心情和感受' },
    { name: '成就', description: '庆祝里程碑和成就' },
    { name: '问答', description: '提问和回答' }
  ];

  res.json({
    categories
  });
}));

export default router;
