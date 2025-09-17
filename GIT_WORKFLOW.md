# Git 工作流程指南

## 分支策略

基于现代 Git 最佳实践 <mcreference link="https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow" index="1">1</mcreference>，我们采用简化的分支模型：

### 主要分支

- **`main`** - 生产分支，包含稳定的生产代码
- **`develop`** - 开发分支，包含最新的开发功能
- **`feature/*`** - 功能分支，用于开发新功能
- **`hotfix/*`** - 热修复分支，用于紧急修复生产问题

## 工作流程

### 1. 功能开发流程

```bash
# 1. 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/新功能名称

# 2. 开发功能
# ... 进行开发工作 ...

# 3. 提交代码
git add .
git commit -m "feat: 添加新功能描述"

# 4. 推送到远程仓库
git push origin feature/新功能名称

# 5. 创建 Pull Request 到 develop 分支
# 6. 代码审查通过后合并到 develop
# 7. 删除功能分支
git branch -d feature/新功能名称
```

### 2. 发布流程

```bash
# 1. 从 develop 创建发布分支
git checkout develop
git checkout -b release/v1.0.0

# 2. 进行发布准备（版本号更新、文档更新等）
# 3. 测试验证
# 4. 合并到 main 和 develop
git checkout main
git merge release/v1.0.0
git tag v1.0.0

git checkout develop
git merge release/v1.0.0

# 5. 删除发布分支
git branch -d release/v1.0.0
```

### 3. 热修复流程

```bash
# 1. 从 main 创建热修复分支
git checkout main
git checkout -b hotfix/修复描述

# 2. 修复问题
# 3. 测试验证
# 4. 合并到 main 和 develop
git checkout main
git merge hotfix/修复描述
git tag v1.0.1

git checkout develop
git merge hotfix/修复描述

# 5. 删除热修复分支
git branch -d hotfix/修复描述
```

## 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型说明

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关变更

### 示例

```bash
feat(auth): 添加用户登录功能
fix(api): 修复数据获取错误
docs: 更新 README 文档
style: 格式化代码
refactor(utils): 重构工具函数
test: 添加登录功能测试
chore: 更新依赖包版本
ci: 添加自动化构建流程
```

## 代码审查规范

### Pull Request 要求

1. **标题清晰**: 简洁描述变更内容
2. **描述详细**: 说明变更原因、影响范围
3. **测试验证**: 确保功能正常、无破坏性变更
4. **代码质量**: 遵循项目代码规范
5. **文档更新**: 必要时更新相关文档

### 审查检查点

- [ ] 代码逻辑正确
- [ ] 性能影响评估
- [ ] 安全性检查
- [ ] 测试覆盖率
- [ ] 文档完整性
- [ ] 向后兼容性

## 自动化脚本

项目包含以下自动化脚本：

- `push-to-github.ps1` - 自动推送到 GitHub
- `auto-build.sh` - 自动构建脚本
- `auto-eas-build.ps1` - EAS 自动构建
- `完全自动化构建.ps1` - 完整自动化流程

## 最佳实践

1. **频繁提交**: 小步快跑，频繁提交代码
2. **分支命名**: 使用有意义的分支名称
3. **代码审查**: 所有代码变更都需要审查
4. **测试先行**: 编写测试用例，确保代码质量
5. **文档同步**: 代码变更时同步更新文档
6. **安全意识**: 不提交敏感信息（密钥、密码等）

## 紧急情况处理

### 回滚发布

```bash
# 1. 回滚到上一个稳定版本
git checkout main
git revert <commit-hash>

# 2. 创建热修复标签
git tag v1.0.1-hotfix

# 3. 推送变更
git push origin main --tags
```

### 数据恢复

参考 GitHub 灾难恢复最佳实践 <mcreference link="https://blog.gitguardian.com/github-restore-and-disaster-recovery-better-get-ready/" index="5">5</mcreference>，确保：

1. 定期备份重要分支
2. 使用多个远程仓库
3. 保持本地副本同步
4. 文档化恢复流程