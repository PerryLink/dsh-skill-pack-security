# 可选 provider 插件（npm bundle）/ Optional provider plugin (npm bundle)

[English](#english) | [中文](#中文)

本目录是一个**可选的** DSH 插件：把包内技能目录注册进 `ctx.skills`，免去把技能复制到扫描根目录的步骤。技能包本体不依赖它。默认发布中文版 `skills/`，`language: 'en'` 发布英文版 `skills-en/`。包已声明 `dsh.bundle` 并发布在 npm：`dsh plugin add @perrylink/dsh-skill-pack-security-provider` 一键挂载。

## English

This directory is an **optional** DSH plugin: it registers the pack's skill directory on `ctx.skills`, so the skills do not need to be copied into a scanned root. The pack itself does not depend on it. It publishes the Chinese edition `skills/` by default; `language: 'en'` publishes the English edition `skills-en/`. The package declares `dsh.bundle` and is published on npm: `dsh plugin add @perrylink/dsh-skill-pack-security-provider` mounts it in one command.

### Design

- Reuses the official `FileSystemSkillProvider` (the provider class exported by `@deepseek-ai/dsh-skill-filesystem`): frontmatter parsing semantics are byte-identical with the official local provider (same fail-closed rules, kebab-case naming, invocation policy) — zero copied parsing logic.
- Configuration `{ includeDefaultRoots: false, customSkillDirs: [pack skills], watch: false }`: exposes only the pack's skills and never conflicts with user/project skill roots; static content needs no watcher.
- Registration is an effect: `ctx.effect(function* () { yield ctx.skills.registerProvider(...) })` — the returned disposer is the registry's effect disposer; the provider lifecycle (signal abort → dispose) is owned by the official class.
- Misconfiguration fails loud: an empty or nonexistent `skillsDir` (or a default resolution that finds neither layout) throws at `apply()` time instead of silently mounting zero skills.
- Root resolution supports two layouts: the repository layout (`skills/` beside `provider/`) and the published layout (`pack/skills` embedded beside `lib/` by `prepack`).

### Configuration

| Key | Type | Default | Meaning |
|---|---|---|---|
| `language` | `'zh' \| 'en'` | `'zh'` | Which edition to publish: the Chinese `skills/` or the English `skills-en/`. Ignored when `skillsDir` is set. |
| `skillsDir` | string | — | Explicit skills root; overrides the `language`-derived default. Must exist and contain at least one `<skill>/SKILL.md` bundle, otherwise the plugin refuses to load. |
| `watch` | boolean | `false` | Whether to watch the packaged directory; packaged content is static. |
| `vet.dataResponsibility` | boolean | `true` | Run the `plugin_vet` data-responsibility review (ungated sensitive-seam hooks, undisclosed outbound endpoints, description-behavior coverage, embedded instruction-override payloads). Full `vet.*` documentation lives in the root README. |

### Mounting (any one)

1. **npm bundle (recommended)**: `dsh plugin add @perrylink/dsh-skill-pack-security-provider`. The `dsh.bundle` manifest applies `cordis.patch.yml`, which mounts the Chinese edition; edit the patch row's `config.language` for English.
2. Copy this directory into a project plugin directory and load it by local path in `cordis.yml`:

```yaml
plugins:
  - name: ./provider
```

3. During development, source-launch: the `dsh` CLI source launch runs through the tsx ESM hook, so point it directly at `provider/src/index.ts`.

### Dependencies, build, and packaging

- peerDependencies: `@deepseek-ai/cordis@^4.0.1`, `@deepseek-ai/dsh-skill-filesystem@0.1.0-rc.6`, `@deepseek-ai/schemastery@^3.18.1` (all published on the npm registry — the provider installs and builds standalone).
- Build: `pnpm install --frozen-lockfile && pnpm run build` (`tsc` emits `lib/index.js` + `lib/types/index.d.ts`; the committed `pnpm-lock.yaml` keeps the build reproducible).
- Packaging: `prepack` runs `scripts/copy-skills.mjs`, which embeds both editions into `pack/`; `files` then ships `lib/`, `pack/`, and `cordis.patch.yml`, so `pnpm pack` produces a self-contained tarball (npm `files` cannot reach outside the package directory, which is why the copy exists).
- Contract notes: `name` + `inject: ['skills']` + `apply(ctx, config)`; the configuration is a Schemastery schema (no plain objects); `providerName` is unique within the registry layer (`'skill-pack-security'`).
- Publishing: published on npm as `@perrylink/dsh-skill-pack-security-provider` — the `@dsh-skill-pack-security` scope was not owned by this publisher, so the package was renamed; `cordis.patch.yml`'s `name` row and every README reference carry the published name. Publish new versions with `npm publish --access public` (see `docs/release-checklist.md` step 9).

### Verification

Check 8 of `../verify/verify-skill-pack.mts` exercises this plugin: mounting the default config lists the 8 Chinese skills (`provider === 'skill-pack-security'`), `language: 'en'` lists the English edition, an explicit `skillsDir` mounts that root, empty/nonexistent `skillsDir` values are rejected, and after dispose the registries are empty. CI additionally builds the plugin standalone, packs it, and asserts the tarball carries `lib/`, both embedded editions in `pack/`, and `cordis.patch.yml` (`provider` job in `.github/workflows/verify.yml`).

## 中文

本目录是**可选**的 DSH 插件：把包内技能目录注册进 `ctx.skills`，免去复制技能到扫描根目录。技能包本体不依赖它。默认发布中文版 `skills/`，`language: 'en'` 发布英文版 `skills-en/`。包已声明 `dsh.bundle` 并发布在 npm：`dsh plugin add @perrylink/dsh-skill-pack-security-provider` 一键挂载。

### 设计

- 复用官方 `FileSystemSkillProvider`（`@deepseek-ai/dsh-skill-filesystem` 导出的 provider 类）：frontmatter 解析语义与官方本地提供方逐字节一致（同样的 fail-closed 规则、kebab-case 命名、invocation 策略），零复制解析逻辑。
- 配置 `{ includeDefaultRoots: false, customSkillDirs: [包内技能目录], watch: false }`：只暴露本包技能，不与用户/项目技能根冲突；静态内容不启用 watcher。
- 注册即 effect：`ctx.effect(function* () { yield ctx.skills.registerProvider(...) })`，返回的 disposer 就是注册表提供的 effect disposer；provider 生命周期（signal abort → dispose）由官方类接管。
- 错误配置响亮失败：`skillsDir` 为空、不存在或默认解析找不到任何布局时，`apply()` 直接抛错，绝不静默挂载零技能。
- 根目录解析支持两种布局：仓库布局（`skills/` 与 `provider/` 并列）与发布布局（`prepack` 把双语言版嵌入包内 `pack/skills`，与 `lib/` 并列）。

### 配置

| 键 | 类型 | 默认 | 含义 |
|---|---|---|---|
| `language` | `'zh' \| 'en'` | `'zh'` | 发布哪个语言版：中文 `skills/` 或英文 `skills-en/`；设置了 `skillsDir` 时忽略 |
| `skillsDir` | string | — | 显式指定技能根目录，覆盖 `language` 推导的默认值；必须存在且含至少一个 `<skill>/SKILL.md` 包，否则插件拒绝加载 |
| `watch` | boolean | `false` | 是否监听包内技能目录；静态内容无需监听 |
| `vet.dataResponsibility` | boolean | `true` | 运行 `plugin_vet` 数据责任审查（无门控敏感监听、未披露出站端点、描述-行为覆盖率、随包文本中的指令覆盖类注入载荷）；完整 `vet.*` 文档见根 README |

### 挂载方式（任选）

1. **npm bundle（推荐）**：执行 `dsh plugin add @perrylink/dsh-skill-pack-security-provider`。`dsh.bundle` 清单应用 `cordis.patch.yml`，默认挂载中文版；要英文版改 patch 行里的 `config.language`。
2. 复制本目录进项目插件目录，在 `cordis.yml` 里以本地路径加载：

```yaml
plugins:
  - name: ./provider
```

3. 开发期 source-launch：`dsh` CLI 源码启动走 tsx ESM hook，直接指到 `provider/src/index.ts`。

### 依赖、构建与打包

- peerDependencies：`@deepseek-ai/cordis@^4.0.1`、`@deepseek-ai/dsh-skill-filesystem@0.1.0-rc.6`、`@deepseek-ai/schemastery@^3.18.1`（均已发布在 npm registry，插件可独立安装构建）。
- 构建：`pnpm install --frozen-lockfile && pnpm run build`（`tsc` 输出 `lib/index.js` + `lib/types/index.d.ts`；提交的 `pnpm-lock.yaml` 保证构建可复现）。
- 打包：`prepack` 执行 `scripts/copy-skills.mjs` 把双语言版嵌入 `pack/`；`files` 随包发布 `lib/`、`pack/` 与 `cordis.patch.yml`，因此 `pnpm pack` 产出即自包含 tarball（npm `files` 不能包含包外路径，这是拷贝步骤存在的原因）。
- 契约要点：`name` + `inject: ['skills']` + `apply(ctx, config)`；配置为 Schemastery schema（禁止普通对象）；`providerName` 在注册表层内唯一（'skill-pack-security'）。
- 发布：已发布在 npm，包名 `@perrylink/dsh-skill-pack-security-provider`——scope `@dsh-skill-pack-security` 不为本发布者所有，故改名；`cordis.patch.yml` 的 `name` 行与全部 README 引用均已同步为发布名。新版本用 `npm publish --access public` 发布（见 `docs/release-checklist.md` 第 9 步）。

### 验证

`../verify/verify-skill-pack.mts` 第 8 项实测本插件：默认配置挂载列出 8 个中文技能（`provider === 'skill-pack-security'`），`language: 'en'` 列出英文版，显式 `skillsDir` 挂载指定根目录，空/不存在的 `skillsDir` 被拒绝，dispose 后注册表为空。CI 另有 `provider` job（`.github/workflows/verify.yml`）独立构建并打包，断言 tarball 含 `lib/`、`pack/` 双语言版与 `cordis.patch.yml`。
