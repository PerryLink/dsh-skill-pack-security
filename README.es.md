<div align="center">

# dsh-skill-pack-security

**Ocho skills de auditoría de seguridad más una puerta automática de cadena de suministro de plugins para DeepSeek Harness.**

*Las skills enseñan la metodología de auditoría; la herramienta `plugin_vet` ejecuta el escaneo previo a la instalación — licencia / SBOM / pin de commit / patrones maliciosos / tarjeta de riesgo de cinco dimensiones.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-skill-pack-security/verify.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-skill-pack-security/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-skill-pack-security?label=version)](https://github.com/PerryLink/dsh-skill-pack-security/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [हिन्दी](README.hi.md)

</div>

---

## Compatibility

| Superficie | Estado |
|---|---|
| Harness | DeepSeek Harness `0.1.0-rc.6` |
| Node | `^22.19.0 \|\| >=24.0.0` (el runtime de DeepSeek Harness) |
| Plataformas | Todas (las skills son contenido; el provider es un plugin de host) |
| Modelo | Cualquiera (las skills cargan bajo demanda con la herramienta `skill`; `plugin_vet` es determinista) |

## What you get

`dsh-skill-pack-security` es un **paquete de skills + puerta de cadena de suministro** para DeepSeek Harness. Distribuye ocho metodologías de seguridad como bundles `SKILL.md` que el modelo descubre en su catálogo de sesión y carga bajo demanda con la herramienta `skill`, más el escáner automático `plugin_vet` previo a la instalación. **Las skills enseñan la metodología; el plugin ejecuta las comprobaciones estáticas.**

- **Ocho skills, dos ediciones** — cada skill se distribuye con nombres y metadatos idénticos en `skills/` (chino) y `skills-en/` (inglés); instala un idioma por raíz.
- **Puerta `plugin_vet`** — un escáner sin dependencias (licencia / SBOM / pin de commit / patrones maliciosos / tarjeta de riesgo de cinco dimensiones) registrado por el plugin opcional `provider/` en `ctx.tools`.
- **Los hallazgos citan las skills** — cada hallazgo apunta a la sección de skill correspondiente (por ejemplo `supply-chain-review §1`) para continuar la auditoría manual.
- **Ejecutable por un modelo** — cada paso de skill es un comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) con muestra de salida esperada y criterio de código de salida.

## The eight skills

| Skill | Propósito | Cuándo usarla |
|---|---|---|
| `security-audit` | Flujo de auditoría en cinco fases: alcance → inventario → clasificación de riesgos → verificación → plantilla de informe | Auditorías de repo completo, informes, planificación |
| `secret-scan` | Auditoría de credenciales: uso de gitleaks/trivy, niveles de falsos positivos, informes redactados, orden de remediación | Escaneo de secretos, triaje de alertas, informes de fugas |
| `dependency-audit` | Auditoría de cadena de suministro: lectura de pnpm/npm audit, licencias, riesgo de typosquat, deriva del lockfile | Revisión de dependencias, interpretación de informes |
| `supply-chain-review` | Revisión rápida de PR/nuevas dependencias: scripts de instalación peligrosos, typosquat, builds reproducibles | Revisar PRs que añaden dependencias |
| `prompt-injection-review` | Revisión de superficies de inyección en proyectos de agentes: AGENTS.md, skills, descripciones de herramientas, MCP, web | Revisar superficies de inyección del contexto del modelo |
| `threat-model` | Modelado de amenazas en fase de diseño: límites de confianza, tabla STRIDE, árboles de ataque, mitigaciones | Modelar nuevas funcionalidades, revisión en fase de diseño |
| `vuln-intel` | Inteligencia de vulnerabilidades: consultas NVD/CISA-KEV/GHSA/OSV con criterios de veredicto | Dado un id CVE/GHSA, comprobar impacto y explotación |
| `incident-response` | Respuesta a incidentes en entornos de agentes: contener → evidencia → recuperar → postmortem | Incidentes sospechosos en configuraciones DSH/de agentes |

Cada bundle mantiene su archivo principal ≤ 300 líneas (divulgación progresiva; los detalles viven en `references/`).

## plugin_vet — the automated pre-install gate

`plugin_vet` es el complemento automático del paquete: un escáner sin dependencias registrado por el plugin `provider/` en `ctx.tools`. Apúntalo a un `owner/repo` de GitHub o a una ruta de paquete local — descarga el tarball una sola vez (respetando timeout + `AbortSignal`), escanea dentro de los límites de presupuesto y devuelve una tarjeta renderizada.

- **Escaneo de licencia** — localiza el archivo LICENSE y el campo `license`; `NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <archivo>`, un archivo o campo faltante se marca; se reconocen los ids SPDX comunes.
- **SBOM** — extrae el árbol de dependencias con versiones desde el lockfile (pnpm/npm/yarn).
- **Bloqueo de commit** — las refs del manifiesto y las acciones de workflows deben ser SHAs de commit inmutables de 40 hex; las refs `@tag`/rama se marcan como mutables.
- **Patrones maliciosos** — scripts de ciclo de vida (`preinstall`/`install`/`postinstall`), dominios de exfiltración y payloads ofuscados/codificados.
- **Informe de riesgo de cinco dimensiones** — licencia / origen / dependencias / scripts de build / mantenimiento, cada una 0–100, plegadas en un veredicto global: PASS, WARN o FAIL.

**Puerta de instalación.** El veredicto alimenta una puerta de instalación — `gate.policy: warn` (por defecto, no bloqueante) imprime una advertencia ante FAIL; `gate.policy: deny` bloquea la instalación:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # bloquea las instalaciones que fallan plugin_vet
```

## Quick start

```sh
# 1. instala el bundle en tu perfil
dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"

# o desde npm (versiones publicadas)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. reinicia y verifica la fila
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Install & uninstall

- **Canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"` — monta el bundle del provider; `prepack` embebe ambas ediciones en el tarball.
- **Canal npm** (versiones publicadas): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`.
- **Canal tarball**: `pnpm pack` en `provider/`, luego `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`.
- **Desinstalar**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (o elimina la fila; las copias puras de skills se quitan con `-Uninstall` / `--uninstall` del instalador).

## Installing the skills by hand

El proveedor local de skills de DSH escanea cuatro raíces por rango (el rango menor gana los conflictos de nombre dentro de una capa):

| Rango | Raíz | Ámbito |
|---|---|---|
| 100 | `<repoRaíz>/.dsh/skills` | Por proyecto, viaja con el repo |
| 200 | `<repoRaíz>/.agents/skills` | Por proyecto, directorio de agentes compartido |
| 400 | `<dshHome>/skills` (`$DSH_HOME` o `~/.dsh`) | Por usuario, solo DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` o `~/.agents`) | Por usuario, entre agentes |

Rangos (el menor gana los conflictos de nombre dentro de una capa): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`. El rango custom 300 lo registra un plugin (como el `provider/` opcional de este pack), no es una raíz de disco.

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (defecto) | en
```

```sh
bash ./scripts/install.sh --target user-agents --language en
```

## Configuration

Todas las opciones son campos Schemastery `Config` (modificables desde cordis.yml). `provider/cordis.patch.yml` documenta cada clave.

| Clave | Por defecto | Significado |
|---|---|---|
| `language` | `zh` | Edición a publicar: la china `skills/` o la inglesa `skills-en/`; se ignora si se define `skillsDir` |
| `watch` | `false` | Vigilar el directorio de skills empaquetado (contenido estático, por eso desactivado) |
| `skillsDir` | *(sin definir)* | Raíz de skills explícita; anula el valor derivado de `language` y debe contener bundles `<skill>/SKILL.md` |
| `vet.enable` | `true` | Registra la herramienta `plugin_vet` |
| `vet.timeoutMs` | `15000` | Timeout de descarga del tarball en ms |
| `vet.maxFiles` | `800` | Tope de archivos escaneados |
| `vet.maxFileBytes` | `262144` | Tope de bytes por archivo |
| `vet.maxExtractBytes` | `67108864` | Tope de bytes de extracción |
| `vet.maxDepNodes` | `600` | Tope de nodos del árbol de dependencias |
| `vet.maxFindingsPerCheck` | `12` | Tope de hallazgos por comprobación |
| `vet.userAgent` | `dsh-skill-pack-security/2.0.0 (+https://github.com/PerryLink/dsh-skill-pack-security)` | User-agent de descarga |
| `vet.gate.policy` | `warn` | Puerta de instalación: `warn` (no bloqueante) o `deny` (bloquea ante FAIL) |

## Tools & surfaces

| Superficie | Tipo | Notas |
|---|---|---|
| `plugin_vet` | tool | Escaneo de cadena de suministro previo a la instalación (licencia / SBOM / bloqueo de commit / malicioso / tarjeta de riesgo); los hallazgos citan secciones de skills |
| `skill-pack-security` | skill provider | Registra la edición `skills/` o `skills-en/` del pack en `ctx.skills` |
| Ocho bundles `SKILL.md` | skills | La metodología de auditoría, en dos ediciones de idioma |
| puerta de instalación | gate | `vet.gate.policy: warn \| deny` decide la instalación |

## Permissions & data

- **Permisos**: el manifiesto `dshWorkshop` declara `files:read` y `network:fetch`.
- **Datos**: `plugin_vet` descarga un tarball una sola vez (respetando timeout + `AbortSignal`) y los informes redactan los textos con forma de secreto; el plugin no inyecta secciones de prompt.

## Security boundaries

- **Motor sin dependencias.** `plugin_vet` usa solo builtins de `node:` e imports relativos.
- **Puerta previa a la instalación de alcance acotado.** No es una herramienta de auditoría de propósito general — deliberadamente complementaria a los plugins escáner y al validador oficial `dsh-plugin-check`.
- **No bloqueante por defecto.** La puerta de instalación es `warn` salvo que optes por `deny`.
- **Contenido original.** Compatible con el formato de skills de Claude Code, pero sin contenido copiado de CC y sin marketplace de skills.

## Verification

`verify/verify-skill-pack.mts` importa el parser **oficial** `dsh-skill-filesystem`, la herramienta **real** `skill` y el runtime de herramientas **real** desde un checkout local de `deepseek-harness` y ejecuta 25 comprobaciones sobre ambas ediciones: estructura y validez del frontmatter, cero conflictos de nombre con skills oficiales/comunitarias, cargas completas vía `ctx.skills.get()`, comportamiento de `plugin_vet` a través del runtime de herramientas real, el invariante de cero dependencias y la redacción de informes. Las mismas 25 comprobaciones se ejecutan en GitHub vía `.github/workflows/verify.yml` (Ubuntu y Windows).

## Known limitations

- **No es una herramienta de auditoría completa.** `plugin_vet` es una puerta de confianza previa a la instalación; no puede sustituir una auditoría manual de principio a fin.
- **Solo escaneo estático.** Las señales de patrones maliciosos y mantenimiento son heurísticas sobre el paquete distribuido, no análisis dinámico.
- **Una edición por raíz.** Las skills del mismo nombre en una raíz se resuelven por rango, de modo que solo una edición entra en un catálogo de sesión.

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # embebe ambas ediciones en el tarball
tsx verify/verify-skill-pack.mts    # verificación headless de 25 comprobaciones
```

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor y mantenedor: las ocho skills en ambas ediciones, los instaladores, la suite de verificación, el bundle del provider, CI y la documentación.

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
