import { pgTable, serial, varchar, text, integer, boolean, timestamp, date, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLogin: timestamp('last_login'),
  timezone: varchar('timezone', { length: 50 }).default('Asia/Shanghai'),
});

// 成瘾类型表
export const addictionTypes = pgTable('addiction_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  colorCode: varchar('color_code', { length: 7 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 戒断会话表
export const recoverySessions = pgTable('recovery_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addictionTypeId: integer('addiction_type_id').references(() => addictionTypes.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  targetDays: integer('target_days').default(30),
  notes: text('notes'),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 任务表
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  difficultyLevel: integer('difficulty_level'),
  points: integer('points').default(10),
  isDaily: boolean('is_daily').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 用户任务完成记录表
export const userTaskCompletions = pgTable('user_task_completions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  completedDate: date('completed_date').notNull(),
  pointsEarned: integer('points_earned'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 用户积分表
export const userPoints = pgTable('user_points', {
  userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  totalPoints: integer('total_points').default(0).notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 每日签到表
export const dailyCheckins = pgTable('daily_checkins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recoverySessionId: integer('recovery_session_id').references(() => recoverySessions.id),
  checkinDate: date('checkin_date').notNull(),
  moodRating: integer('mood_rating'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 社区帖子表
export const communityPosts = pgTable('community_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  isApproved: boolean('is_approved').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 社区评论表
export const communityComments = pgTable('community_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: integer('parent_id').references(() => communityComments.id),
  likesCount: integer('likes_count').default(0).notNull(),
  isApproved: boolean('is_approved').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 成就表
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  pointsRequired: integer('points_required'),
  daysRequired: integer('days_required'),
  category: varchar('category', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 用户成就表
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  earnedDate: date('earned_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 点赞表
export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: varchar('target_type', { length: 20 }).notNull(),
  targetId: integer('target_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  recoverySessions: many(recoverySessions),
  taskCompletions: many(userTaskCompletions),
  userPoints: many(userPoints),
  dailyCheckins: many(dailyCheckins),
  communityPosts: many(communityPosts),
  communityComments: many(communityComments),
  userAchievements: many(userAchievements),
  likes: many(likes),
}));

export const addictionTypesRelations = relations(addictionTypes, ({ many }) => ({
  recoverySessions: many(recoverySessions),
}));

export const recoverySessionsRelations = relations(recoverySessions, ({ one, many }) => ({
  user: one(users, {
    fields: [recoverySessions.userId],
    references: [users.id],
  }),
  addictionType: one(addictionTypes, {
    fields: [recoverySessions.addictionTypeId],
    references: [addictionTypes.id],
  }),
  dailyCheckins: many(dailyCheckins),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  userTaskCompletions: many(userTaskCompletions),
}));

export const userTaskCompletionsRelations = relations(userTaskCompletions, ({ one }) => ({
  user: one(users, {
    fields: [userTaskCompletions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTaskCompletions.taskId],
    references: [tasks.id],
  }),
}));

export const userPointsRelations = relations(userPoints, ({ one }) => ({
  user: one(users, {
    fields: [userPoints.userId],
    references: [users.id],
  }),
}));

export const dailyCheckinsRelations = relations(dailyCheckins, ({ one }) => ({
  user: one(users, {
    fields: [dailyCheckins.userId],
    references: [users.id],
  }),
  recoverySession: one(recoverySessions, {
    fields: [dailyCheckins.recoverySessionId],
    references: [recoverySessions.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  comments: many(communityComments),
  likes: many(likes),
}));

export const communityCommentsRelations = relations(communityComments, ({ one, many }) => ({
  post: one(communityPosts, {
    fields: [communityComments.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityComments.userId],
    references: [users.id],
  }),
  parent: one(communityComments, {
    fields: [communityComments.parentId],
    references: [communityComments.id],
  }),
  replies: many(communityComments),
  likes: many(likes),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));
