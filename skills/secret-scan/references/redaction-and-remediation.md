# 脱敏规范与修复流程（secret-scan/references/redaction-and-remediation.md）

主文件第 5、6 节的完整细则。

## 脱敏规则

1. 报告中的密钥只允许三种表示：
   - 类型标记 + 前 6 字符 + 省略号：`GitHub token ghp_abc…`
   - 哈希引用：`sha256 前 12 位 <hex>`（`echo -n '<值>' | sha256sum` 后截取，供日志对照而不泄露原值）
   - 位置引用：`文件:行 + 提交哈希`（如 `src/ci/deploy.sh:12 @ a1b2c3d`）
2. 不允许出现：完整密钥、`--redact` 之前的 gitleaks 原始 JSON、终端中粘贴过的密钥回显。
3. 每次生成报告后跑自检：

```sh
grep -nE '(ghp_[A-Za-z0-9]|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]|-----BEGIN (RSA|OPENSSH|EC) )' 报告.md
```

预期输出：无匹配。有匹配 = 报告自身泄露，先整改再交付。

## 修复四步（固定顺序）

### 1. 轮换（rotate）

- 在密钥签发方（GitHub/GitLab/云厂商）生成新值。
- 替换使用处：`git grep -l '<旧密钥前6字符>'` 找到引用文件后逐处替换。
- 完成判据：新密钥生效（用新值跑一次原用途成功），旧密钥不再被任何配置引用（`git grep '<前6字符>'` 无命中）。

### 2. 撤销（revoke）

- 在控制台撤销旧密钥。
- 完成判据：控制台显示已撤销；如厂商支持，用旧值调一次 API 预期返回 401/403（该调用只发旧值，且旧值已撤销，安全）。

### 3. 清除历史（可选、高风险）

```sh
git filter-repo --path <泄露文件> --invert-paths --force
git push origin --force --all
```

- 硬性前置（缺一不执行，只写建议）：仓库完整备份（`git clone --mirror <url> backup.git`）；所有协作者已知情并同意 rebase。
- 已知代价：所有提交哈希改变，PR/CI 关联全部失效。
- 不执行时的替代：保留历史，报告写"历史密钥已轮换+撤销（级D），残留历史因 <原因> 未清除"。

### 4. 防护（门禁）

- `.gitignore` 排除：`printf '.env*\n*.pem\n' >> .gitignore`（已跟踪的文件需 `git rm --cached <file>` 停止跟踪）。
- pre-commit 门禁（`.pre-commit-config.yaml` 片段）：

```yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.3
    hooks:
      - id: gitleaks
```

- CI 门禁（任意 CI 的一步）：`gitleaks detect --source . -v`，退出码非 0 即失败。
- 完成判据：故意提交一个假密钥（如 `ghp_FAKE0000000000000000000000000000FAKE`）到测试分支，门禁必须拦截；拦截成功后可移除该测试提交。
