<div align="center">

# dsh-skill-pack-security
- **Canal 1024 store**: `npm i -g dsh1024` una vez, luego `dsh1024 plugin --profile web add dsh-skill-pack-security` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

**Ocho skills de auditoría de seguridad más una puerta automática de cadena de suministro de plugins para DeepSeek Harness.**

*Las skills enseñan la metodología de auditoría; la herramienta `plugin_vet` ejecuta el escaneo previo a la instalación — licencia / SBOM / pin de commit / patrones maliciosos / tarjeta de riesgo de cinco dimensiones.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-skill-pack-security)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-skill-pack-security/verify.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-skill-pack-security/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-skill-pack-security?label=version)](https://github.com/PerryLink/dsh-skill-pack-security/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-skill-pack-security?metric=downloads&lang=es)](https://dshfind.com/es/plugins/PerryLink/dsh-skill-pack-security?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-skill-pack-security
```


</div>

---

## Install & uninstall

- **Canal git** (último `main`): `dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security` — monta el bundle del provider; `prepack` embebe ambas ediciones en el tarball.
- **Canal npm** (versiones publicadas): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`.
- **Canal tarball**: `pnpm pack` en `provider/`, luego `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`.
- **Desinstalar**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (o elimina la fila; las copias puras de skills se quitan con `-Uninstall` / `--uninstall` del instalador).

## What is dsh-skill-pack-security?

Ocho skills de auditoría de seguridad más una puerta automática de cadena de suministro de plugins para DeepSeek Harness.

Las skills enseñan la metodología de auditoría; la herramienta `plugin_vet` ejecuta el escaneo previo a la instalación — licencia / SBOM / pin de commit / patrones maliciosos / tarjeta de riesgo de cinco dimensiones.

![Demostración de terminal de dsh-skill-pack-security: dsh-skill-pack-security — install the provider, verify all 25 checks](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-hero.png)

![Animated terminal demo of dsh-skill-pack-security](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-demo.gif)

*La misma ejecución, animada.*

## Comparison

![Gráfico comparativo medido de dsh-skill-pack-security](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-evidence.png)

38 poison samples (20 malicious, 18 benign) · benchmark/RESULTS.md

## Compatibility

| Superficie | Estado |
|---|---|
| Harness | DeepSeek Harness **`dsh-v0.2.1-alpha.1`** (GitHub tag, verificado el 2026-09-25: cadena completa de gates + smoke de instalación de perfil). Línea de dependencia npm: `@deepseek-ai/dsh` **0.1.5-rc.2** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`). El sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia. |
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

**Puerta de instalación.** El veredicto alimenta una puerta de instalación — `gate.policy: warn` (por defecto, no bloqueante) imprime una advertencia ante FAIL; `gate.policy: deny` devuelve un veredicto de denegación; la herramienta no intercepta `dsh plugin add`, lo aplica el instalador/CI:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # devuelve denegación; el llamador la aplica
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
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security
```

```sh
# 1. instala el bundle en tu perfil
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security

# o desde npm (versiones publicadas)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. reinicia y verifica la fila
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

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
| `vet.userAgent` | `dsh-skill-pack-security/2.2.24 (+https://github.com/PerryLink/dsh-skill-pack-security)` | User-agent de descarga |
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

Este proyecto es uno de los **87 plugins activamente mantenidos** de DeepSeek Harness de [PerryLink](https://github.com/PerryLink). El registro familiar tiene **95** plugins — **5 congelados**, **3 retirados** — y permanece plegado abajo para que cada README conserve una primera pantalla corta. Expándelo para ver cada fila, con el motivo en la columna Estado.

<details>
<summary>Expandir los 95 plugins</summary>

| Plugin | Una línea | Estado |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.
