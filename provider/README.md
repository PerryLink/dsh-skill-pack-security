# 可选 provider 插件（打包分发示范）

本目录是一个**可选的** DSH 插件：把包内 `skills/` 目录注册进 `ctx.skills`，免去把技能复制到扫描根目录的步骤。技能包本体不依赖它。

## 设计

- 复用官方 `FileSystemSkillProvider`（`@deepseek-ai/dsh-skill-filesystem` 导出的 provider 类）：frontmatter 解析语义与官方本地提供方逐字节一致（同样的 fail-closed 规则、kebab-case 命名、invocation 策略），零复制解析逻辑。
- 配置 `{ includeDefaultRoots: false, customSkillDirs: [包内 skills/], watch: false }`：只暴露本包技能，不与用户/项目技能根冲突；静态内容不启用 watcher。
- 注册即 effect：`ctx.effect(function* () { yield ctx.skills.registerProvider(...) })`，返回的 disposer 就是注册表提供的 effect disposer；provider 生命周期（signal abort → dispose）由官方类接管。

## 挂载方式（任选）

1. 复制本目录进项目插件目录，在 `cordis.yml` 里以本地路径加载：

```yaml
plugins:
  - name: ./provider
```

2. 发布为 npm/tarball 后按官方 publish 流程挂载（bundle/patch 见官方 docs）。
3. 开发期 source-launch：`dsh` CLI 源码启动走 tsx ESM hook，直接指到 `provider/src/index.ts`。

## 依赖与构建

- peerDependencies：`@deepseek-ai/cordis`、`@deepseek-ai/dsh-skill-filesystem`、`@deepseek-ai/schemastery`（DSH 环境自带）。
- 构建：`pnpm install && pnpm run build`（tsdown 输出 `lib/index.js`；src/ 与 lib/ 都在 provider/ 下一层，默认 `skillsDir` 两种布局下都解析到包的兄弟 `skills/` 目录）。
- 契约要点：`name` + `inject: ['skills']` + `apply(ctx, config)`；配置为 Schemastery schema（禁止普通对象）；`providerName` 在注册表层内唯一（'skill-pack-security'）。
- npm 打包注意：npm 的 `files` 不允许包含包外路径，因此发布为独立 npm 包时 `skills/` 不会进包——发布物需把 `skills/` 放到可解析的兄弟目录，或通过 `config.skillsDir` 显式指定技能根目录。

## 验证

`../verify/verify-skill-pack.mts` 的最后一步实测本插件：挂载后 `ctx.skills.list()` 返回 5 个技能且 `provider === 'skill-pack-security'`，dispose 后列表为空。
