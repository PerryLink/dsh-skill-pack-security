<div align="center">

# dsh-skill-pack-security
- **Canal 1024 store**: `npm i -g dsh1024` una vez, luego `dsh1024 plugin --profile web add dsh-skill-pack-security` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

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
| Harness | DeepSeek Harness `0.1.1-rc.2` 0.1.2-alpha.3 (adaptado el 2026-09-01): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia. |
| Node | `^22.19.0 \|\| >=24.0.0` (el runtime de DeepSeek Harness) |
| Plataformas | Todas (las skills son contenido; el provider es un plugin de host) |
| Modelo | Cualquiera (las skills cargan bajo demanda con la herramienta `skill`; `plugin_vet` es determinista) |

## What you get

`dsh-skill-pack-security` es un **paquete de skills + puerta de cadena de suministro** para DeepSeek Harness. Distribuye ocho metodologías de seguridad como bundles `SKILL.md` que el modelo descubre en su catálogo de sesión y carga bajo demanda con la herramienta `skill`, más el escáner automático `plugin_vet` previo a la instalación. **Las skills enseñan la metodología; el plugin ejecuta las comprobaciones estáticas.**

- **Ocho skills, dos ediciones** — cada skill se distribuye con nombres y metadatos idénticos en `skills/` (chino) y `skills-en/` (inglés); instala un idioma por raíz.
- **Puerta `plugin_vet`** — un escáner sin dependencias (licencia / SBOM / pin de commit / patrones maliciosos / revisión de responsabilidad de datos / tarjeta de riesgo de cinco dimensiones) registrado por el plugin opcional `provider/` en `ctx.tools`.
- **Los hallazgos citan las skills** — cada hallazgo apunta a la sección de skill correspondiente (por ejemplo `supply-chain-review §1`) para continuar la auditoría manual.
- **Ejecutable por un modelo** — cada paso de skill es un comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) con muestra de salida esperada y criterio de código de salida.

## Why skills, not tools?

| Forma | Qué hace | Qué no puede hacer |
|---|---|---|
| Plugin de herramientas (p. ej. escáneres) | **Ejecuta** escaneos, devuelve hallazgos | Interpretar alertas, clasificar falsos positivos, redactar informes |
| Capa de protocolo | **Restringe** un protocolo | Generalizar entre repos y agentes |
| **Paquete de skills (este repo)** | **Enseña metodología**: triaje, informes, orden de remediación — **y** automatiza las comprobaciones estáticas previas a la instalación vía `plugin_vet` | Sustituir una auditoría manual de principio a fin |

Instalado junto a un plugin de seguridad tipo herramienta, ambos se complementan: la herramienta ejecuta el escaneo, la skill dirige la interpretación, el triaje y el informe. Este paquete combina ambas formas: las skills enseñan la metodología y `plugin_vet` ejecuta el subconjunto estático automáticamente, con cada hallazgo apuntando de vuelta a las skills.

Los 3000+ skills del ecosistema Claude Code demuestran el valor de distribución de esta forma. El frontmatter `SKILL.md` de DSH (`name`, `description`, `whenToUse`) es compatible con el formato de skills de CC; este paquete usa solo el subconjunto común y su contenido es totalmente original.

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

**Complementario a `dsh-plugin-check`.** Las 36 comprobaciones del validador oficial verifican el *contrato y la calidad* de un plugin (esquema de configuración, registro de efectos, forma JSON de las herramientas); `plugin_vet` verifica la *cadena de suministro* de dónde proviene un plugin. Ejecuta ambos:

| | `dsh-plugin-check` (36 comprobaciones) | `plugin_vet` (este repo) |
|---|---|---|
| Pregunta respondida | ¿Está bien formado este plugin y cumple el contrato? | ¿Es seguro instalar este paquete? |
| Qué mira | Código del plugin, esquema, registros, contratos de herramientas | LICENSE, lockfile, refs de instalación/acciones, scripts de ciclo de vida, exfil/ofuscación, mantenimiento |
| Veredicto | Pasa/falla por comprobación | PASS / WARN / FAIL + puerta |
| Cuándo | Desarrollo o revisión de plugins | Antes de `dsh plugin add`, revisión de PR, puerta de CI de cadena de suministro |
| Bloqueante | Puerta de CI (no cero ante violaciones) | Configurable: `warn` (por defecto) o `deny` |

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

## What's inside

| Ruta | Qué es |
|---|---|
| `skills/<nombre>/SKILL.md` | Las ocho skills (edición china); el frontmatter sigue el contrato oficial de `dsh-skill-filesystem` |
| `skills-en/<nombre>/SKILL.md` | Las ocho skills (edición inglesa); mismos nombres y metadatos que la edición china |
| `skills/<nombre>/references/` | Detalle con divulgación progresiva: matrices de comandos, tablas de triaje, plantillas |
| `scripts/install.ps1` | Instalador de Windows de un comando para las cuatro raíces (ambas ediciones de idioma); registra un manifiesto, soporta `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | El equivalente POSIX (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | Bundle proveedor instalable por npm (declara `dsh.bundle`; embebe ambas ediciones en `pack/` vía `prepack`; `language: zh\|en`); registra el proveedor de skills Y la puerta `plugin_vet` vía `ctx.effect()`, falla en alto ante un `skillsDir` inválido |
| `provider/src/vet/` | El motor de escaneo `plugin_vet` sin dependencias (licencia / SBOM / bloqueo de commit / patrones maliciosos / informe de riesgo) |
| `package.json` | Manifest de bundle raíz: declara `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) y los datos de intake `dshWorkshop` |
| `verify/verify-skill-pack.mts` | Verificación headless contra el parser oficial, la herramienta `skill` real y el runtime de herramientas real — 25 comprobaciones sobre ambas ediciones |
| `VERSION` | Fuente única de versión; cada `metadata.version` de SKILL.md y `provider/package.json` debe coincidir con ella (aplicado por CI) |
| `docs/` | Comprobación de conflictos del ecosistema, lista de publicación, planes de mejora y demos de `plugin_vet` |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Historial de versiones, política de reporte de vulnerabilidades y reglas de contribución/verificación |
| `.github/workflows/verify.yml` | CI: verificación de 25 comprobaciones + ejercicio de instaladores + build/pack del provider (Ubuntu y Windows) |
| `.github/dependabot.yml` | Actualizaciones semanales de dependencias para el provider y GitHub Actions |
| `LICENSE` | Apache License 2.0 |
| `THIRD_PARTY_NOTICES.md` | Postura de terceros: motor sin dependencias, activos evaluados pero no portados, licencias de dependencias peer |

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
| `vet.dataResponsibility` | `true` | Ejecuta la revisión de responsabilidad de datos (desactivable por despliegue) |
| `vet.externalScanners` | `true` | Orquesta `osv-scanner`/`npm audit` cuando sus CLIs están presentes; `false` fuerza el escaneo de dependencias autoconsultado integrado |
| `vet.userAgent` | `dsh-skill-pack-security/2.2.0 (+https://github.com/PerryLink/dsh-skill-pack-security)` | User-agent de descarga |
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
- **Motor original, sin ports de terceros.** El escaneo de licencia y las comprobaciones de patrones maliciosos son implementaciones originales sin dependencias; los activos GPL-Radar / LLM-detective / Sus-PY fueron evaluados para portar, pero no se encontró código fuente público con licencia — véase `THIRD_PARTY_NOTICES.md`.

## Verification

`verify/verify-skill-pack.mts` importa el parser **oficial** `dsh-skill-filesystem`, la herramienta **real** `skill` y el runtime de herramientas **real** desde un checkout local de `deepseek-harness` y ejecuta 25 comprobaciones sobre ambas ediciones de idioma:

1. Estructura: ambas ediciones presentes, 8 bundles de directorio en cada edición, sin skills planas sueltas, `name` del frontmatter coincide con el directorio, ≤ 300 líneas, `references/` conectado, `metadata.version` sincronizado con el archivo `VERSION`
2. Sin conflictos de nombre con las skills oficiales de `.agents/skills/` (derivadas del checkout en tiempo de ejecución) ni con paquetes de skills comunitarios conocidos
3–6. Por edición (china `skills/`, inglesa `skills-en/`): descubrimiento por el registro a través del proveedor oficial, cargas completas vía `ctx.skills.get()`, la herramienta `skill` real devolviendo `<skill_content>` (nombres desconocidos/inválidos rechazados), y el catálogo de sesión conteniendo solo `name` + `description` — `whenToUse` queda fuera del catálogo del modelo (diseño oficial)
7. 13 fixtures de frontmatter inválido ejercitan las reglas oficiales fail-closed (campos faltantes, claves camel-case heredadas, valores no booleanos, nombres no kebab, directorios anidados, desajuste de nombre); las skills en archivo plano cargan y el anidado `**/SKILL.md` no se descubre
8. El plugin proveedor opcional monta la edición china y la inglesa vía `ctx.effect()`, se desmonta limpiamente y rechaza la mala configuración (`skillsDir` vacío o inexistente)
9–15. Comprobaciones de auto-endurecimiento: paridad estructural zh↔en, cableado de referencias (sin archivos colgantes/huérfanos), sincronización de versión del provider, rangos de raíces de skills documentados frente a las constantes oficiales, patrones `grep -E` portables a POSIX, auto-comprobación de secretos, lista de verificación de publicación segura en UTF-8
16–19. `plugin_vet` a través del runtime de herramientas real: se registra en `ctx.tools`; el fixture conforme pasa; el fixture sin licencia falla y cita `dependency-audit §3`; el fixture postinstall malicioso falla (scripts/exfil/ofuscación, citando `supply-chain-review §1`); la puerta bloquea la instalación bajo `policy: deny`
20. El motor de escaneo no tiene dependencias (solo builtins `node:` e imports relativos)
21. La redacción de informes mantiene fuera del resultado renderizado los textos con forma de secreto

```powershell
# local: resuelve automáticamente el checkout del harness junto al pack, o apúntalo explícitamente
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 25 checks passed for dsh-skill-pack-security.
```

Las mismas 25 comprobaciones se ejecutan en GitHub en cada push mediante `.github/workflows/verify.yml` — en Ubuntu y Windows — más un ejercicio de `install.sh`/`install.ps1` y un build/pack independiente del provider que comprueba que el tarball lleva ambas ediciones embebidas y el parche del bundle.

## Known limitations

- **No es una herramienta de auditoría completa.** `plugin_vet` es una puerta de confianza previa a la instalación; no puede sustituir una auditoría manual de principio a fin.
- **Solo escaneo estático.** Las señales de patrones maliciosos y mantenimiento son heurísticas sobre el paquete distribuido, no análisis dinámico.
- **Una edición por raíz.** Las skills del mismo nombre en una raíz se resuelven por rango, de modo que solo una edición entra en un catálogo de sesión.

## Roadmap

- `dsh-skill-pack-data-engineering` — pipelines de datos, calidad de datos, listas de verificación ETL (misma plantilla)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triaje de issues, flujos de mantenedor
- `dsh-skill-pack-performance` — metodología de profiling, criterios de benchmark, listas de regresión
- Más skills dentro de este pack (mismo límite de skill puro): `sbom-lifecycle` (flujos de generación/envejecimiento/importación de SBOM), `pen-test-review` (alcance de compromisos autorizados y revisión de informes), `compliance-audit` (recorridos ASVS/NIST-CSF)
- Mantén frescos los artefactos de demo de `plugin_vet` (`docs/demos/run-demos.mjs`) y precisa la tabla de complementariedad con `dsh-plugin-check`

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # embebe ambas ediciones en el tarball
tsx verify/verify-skill-pack.mts    # verificación headless de 25 comprobaciones
```

### Benchmark

El conjunto de regresión de muestras envenenadas (tasa de detección / FPR / F1 por clase sobre 38 muestras, más la brecha frente a OSV/Socket) está en [`benchmark/RESULTS.md`](benchmark/RESULTS.md); regenéralo con `pnpm --dir provider run build && node benchmark/run.mjs` (cero dependencias nuevas).

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — autor y mantenedor: las ocho skills en ambas ediciones, los instaladores, la suite de verificación, el bundle del provider, CI y la documentación.

## PerryLink DSH Plugin Family

Este proyecto es uno de los [33 complementos de DeepSeek Harness](https://github.com/PerryLink) mantenidos por [PerryLink](https://github.com/PerryLink). Si este te ayuda, probablemente los demás también:

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | Auto-revisión de segundo modelo en la cadena de aprobación, con cierre en fallo por defecto | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | Agentes hijos en segundo plano durables con barra lateral de UI web, mensajería e interrupción | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | Gobernanza de costes para DeepSeek Harness: presupuestos, carbono y latencia en un panel. | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Equivalente a /rewind de Claude Code: instantáneas, bifurcaciones de sesión, restauración de un solo uso | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | Migra sesiones, memoria, habilidades y CLAUDE.md de Claude Code a DSH | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | Control de escritorio nativo multiplataforma para DeepSeek Harness — Windows primero. | |
| **[dsh-dsh-composer-history](https://github.com/PerryLink/dsh-dsh-composer-history)** | Historial de entrada estilo terminal para el compositor web: flechas, búsqueda Ctrl+R | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | Comprobaciones de calidad de datasets y verificación de citas (el puente numérico opcional consumido aquí) | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | Defensa contra inyección de prompts, jailbreak y fuga de secretos para DeepSeek Harness. | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | Guardián de disciplina de ingeniería: interrogatorio de requisitos, puertas de pruebas, revisión adversaria | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | Enrutamiento unificado de generación de imágenes estáticas para DeepSeek Harness. | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | Diagnóstico de rendimiento de solo lectura para DeepSeek Harness. | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | Informes de investigación deterministas para fondos mutuos públicos chinos | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | Integración de PR/issues de GitHub para DSH, cada escritura controlada por aprobación | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | Orquestación de investigación sectorial que sella sus entregables mediante el `ctx.researchReport.assemble` de este plugin | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | Base de conocimiento documental local para DeepSeek Harness. | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | Integración de modelos locales (Ollama) para DeepSeek Harness. | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | Diagnósticos, formato, autocompletado, acciones de código y renombrado LSP sobre servidores de lenguaje | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | Middleware de enmascaramiento de PII: anonimiza en el límite del modelo, restaura en la capa de visualización | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | Panel de tiempo de ejecución MCP de solo lectura: comando /mcp + pestaña Settings con estado, herramientas y errores | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | Memoria entre sesiones controlada por aprobación: costura ctx.memory + SQLite + herramienta de memoria | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | Exportador de observabilidad OpenTelemetry y Langfuse para DeepSeek Harness. | |
| **[dsh-dsh-output-styles](https://github.com/PerryLink/dsh-dsh-output-styles)** | Cambio de estilo en tiempo de ejecución equivalente a outputStyles de Claude Code | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | Reglas de permisos declarativas allow/deny/ask estilo Claude Code con auditoría | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | Base de conocimiento de desarrollo de plugins como habilidad de agente bajo demanda | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | Motor de informes de investigación verificables con evidencia direccionada por contenido | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | Puntuación de calidad multidimensional para plugins de DeepSeek Harness. | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | Fija sesiones en la barra lateral web con orden durable | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | Sincronización de sesiones entre dispositivos para DeepSeek Harness — un espejo git dedicado de tu almacén de sesiones. | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | Bucle de sesión con voz para DeepSeek Harness: háblale y escucha su respuesta. | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | Pruebas de instalación y humo aisladas para plugins de DeepSeek Harness. | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | Traducción de parámetros entre proveedores y reparación determinista de JSON para DeepSeek Harness. | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
