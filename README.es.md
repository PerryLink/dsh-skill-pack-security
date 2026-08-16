<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Puerta de seguridad de la cadena de suministro + metodología de auditoría para DeepSeek Harness — ocho skills de agente, un escáner automático previo a la instalación.</b><br/>
  plugin_vet · escaneos de licencia / SBOM / pin de commit / malware · tarjeta de riesgo de cinco dimensiones · escaneo de secretos · auditoría de dependencias · revisión de cadena de suministro · revisión de inyección de prompts · orquestación de auditorías · modelado de amenazas · inteligencia de vulnerabilidades · respuesta a incidentes
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <b><a href="README.es.md">Español</a></b> ·
  <a href="README.pt.md">Português</a> ·
  <a href="README.hi.md">हिन्दी</a>
</p>

<p align="center">
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/stargazers"><img src="https://img.shields.io/github/stars/PerryLink/dsh-skill-pack-security?style=flat-square&color=yellow" alt="Stars"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/network/members"><img src="https://img.shields.io/github/forks/PerryLink/dsh-skill-pack-security?style=flat-square&color=blue" alt="Forks"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/v/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=cb3837" alt="versión npm"></a>
  <a href="https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider"><img src="https://img.shields.io/npm/dw/@perrylink/dsh-skill-pack-security-provider?style=flat-square&color=blue" alt="descargas npm (semanal)"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Licencia: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Tema: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Tema: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-8-8257D0" alt="8 skills">
  <img src="https://img.shields.io/badge/verified-25%2F25%20checks-brightgreen" alt="Verificado: 25/25 comprobaciones">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Idiomas: EN/ZH/ES/PT/HI">
</p>

---

## ¿Qué es esto?

Un **paquete de skills + puerta de cadena de suministro** para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — el arnés de agentes «todo es un plugin» construido sobre [Cordis](https://github.com/cordiverse/cordis). Distribuye ocho metodologías de seguridad como bundles `SKILL.md` (el modelo las descubre en su catálogo de sesión y carga el cuerpo a demanda con la herramienta `skill`) y el escáner automático `plugin_vet` previo a la instalación: las skills enseñan la metodología de auditoría, el plugin ejecuta las comprobaciones estáticas.

> Repositorio: https://github.com/PerryLink/dsh-skill-pack-security

**Las skills enseñan, el plugin ejecuta.** El plugin opcional `provider/` registra la puerta automática `plugin_vet` en `ctx.tools` — un escáner sin dependencias (licencia / SBOM / pin de commit / patrones maliciosos / tarjeta de riesgo de cinco dimensiones) cuyos hallazgos citan las secciones de las skills para la auditoría manual. Instalado como skills puras, sin el proveedor, el paquete funciona exactamente igual que antes.

Cada skill es **ejecutable por un modelo**: cada paso es un comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) con una muestra de salida esperada, un criterio de código de salida y criterios de falsos positivos. Sin afirmaciones no verificables.

## ¿Por qué skills y no herramientas?

| Forma | Qué hace | Qué no puede hacer |
|---|---|---|
| Plugin de herramientas (p. ej. escáneres) | **Ejecuta** escaneos, devuelve hallazgos | Interpretar alertas, clasificar falsos positivos, redactar informes |
| Capa de protocolo | **Restringe** un protocolo | Generalizar entre repos y agentes |
| **Paquete de skills (este repo)** | **Enseña metodología**: triaje, informes, orden de remediación — **y** automatiza las comprobaciones estáticas previas a la instalación vía `plugin_vet` | Sustituir una auditoría manual de principio a fin |

Instalado junto a un plugin de seguridad tipo herramienta, ambos se complementan: la herramienta ejecuta el escaneo, la skill dirige la interpretación, el triaje y el informe — el modelo sigue la metodología de este paquete mientras llama a las herramientas del plugin. Este paquete combina ahora ambas formas: las skills enseñan la metodología y `plugin_vet` ejecuta el subconjunto estático de forma automática, con cada hallazgo apuntando de vuelta a las skills.

Los 3000+ skills del ecosistema Claude Code demuestran el valor de distribución de esta forma. El frontmatter `SKILL.md` de DSH (`name`, `description`, `whenToUse`) es compatible con el formato de skills de CC; este paquete usa solo el subconjunto común y su contenido es totalmente original.

## Las ocho skills

| Skill | Propósito en una línea | Cuándo usarla |
|---|---|---|
| `security-audit` | Flujo de auditoría en cinco fases: alcance → inventario → clasificación de riesgos → verificación → plantilla de informe | Auditorías de repo completo, informes, planificación |
| `secret-scan` | Auditoría de credenciales: uso de gitleaks/trivy, niveles de falsos positivos, informes redactados, orden de remediación | Escaneo de secretos, triaje de alertas, informes de fugas |
| `dependency-audit` | Auditoría de cadena de suministro: lectura de pnpm/npm audit, licencias, riesgo de typosquat, deriva del lockfile | Revisión de dependencias, interpretación de informes de auditoría |
| `supply-chain-review` | Revisión rápida de PR/nuevas dependencias: scripts de instalación peligrosos, typosquat, builds reproducibles | Revisar PRs que añaden dependencias |
| `prompt-injection-review` | Revisión de superficies de inyección en proyectos de agentes: AGENTS.md, skills, descripciones de herramientas, MCP, web | Revisar superficies de inyección del contexto del modelo |
| `threat-model` | Modelado de amenazas en fase de diseño: límites de confianza, tabla STRIDE, árboles de ataque, mitigaciones | Modelar nuevas funcionalidades, revisión de seguridad en fase de diseño |
| `vuln-intel` | Inteligencia de vulnerabilidades: consultas NVD/CISA-KEV/GHSA/OSV con criterios de veredicto | Dado un id CVE/GHSA, comprobar impacto y explotación |
| `incident-response` | Respuesta a incidentes en entornos de agentes: contener → evidencia → recuperar → postmortem | Incidentes de seguridad sospechosos en configuraciones DSH/de agentes |

Cada bundle: archivo principal ≤ 300 líneas (divulgación progresiva; los detalles viven en `references/`), `description` autocontenida sobre «cuándo usarla / cuándo no», y `whenToUse` con disparadores precisos.

**Dos ediciones de idioma.** Cada skill se distribuye con nombres y metadatos idénticos en dos ediciones: `skills/` (chino) y `skills-en/` (inglés). Instala un idioma por raíz — las skills con el mismo nombre en una raíz se resuelven por rango, de modo que solo una edición entra en el catálogo de sesión. Reglas de las ediciones de idioma en [docs/release-checklist.md](docs/release-checklist.md).

## plugin_vet — la puerta automática previa a la instalación

`plugin_vet` es el complemento automático del paquete: un escáner sin dependencias registrado por el plugin `provider/` en `ctx.tools`. Apúntalo a un `owner/repo` de GitHub o a una ruta de paquete local — descarga el tarball una sola vez (respetando timeout + `AbortSignal`), escanea dentro de los límites de presupuesto y devuelve una tarjeta renderizada.

Qué comprueba:

- **Escaneo de licencia** — localiza el archivo LICENSE y el campo `license`; `NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <archivo>`, un archivo faltante o un campo faltante se marcan; se reconocen los ids SPDX comunes.
- **SBOM** — extrae el árbol de dependencias con versiones desde el lockfile (pnpm/npm/yarn).
- **Bloqueo de commit** — las refs del manifiesto de instalación y las acciones de los workflows deben ser SHAs de commit inmutables de 40 hex; las refs `@tag`/rama se marcan como mutables.
- **Patrones maliciosos** — scripts de ciclo de vida (`preinstall`/`install`/`postinstall`), dominios de exfiltración de red y payloads ofuscados/codificados en el código distribuido.
- **Informe de riesgo de cinco dimensiones** — licencia / origen / dependencias / scripts de build / mantenimiento, cada una 0–100, plegadas en un veredicto global: PASS, WARN o FAIL.

Cada hallazgo cita la sección de skill correspondiente (por ejemplo `supply-chain-review §1`) para que el agente pueda cargar esa skill y continuar la auditoría manual.

**Puerta de instalación.** El veredicto alimenta una puerta de instalación — `gate.policy: warn` (por defecto, no bloqueante) imprime una advertencia ante FAIL; `gate.policy: deny` bloquea la instalación. Configúralo en `cordis.yml`:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # bloquea las instalaciones que fallan plugin_vet
```

**Demos en vivo** (tres repositorios reales, regeneradas en cada versión): [PASS conforme](docs/demos/demo-1-compliant.md) · [FAIL sin licencia](docs/demos/demo-2-no-license.md) · [WARN postinstall](docs/demos/demo-3-postinstall.md) · [BLOQUEADO por puerta deny](docs/demos/demo-4-deny.md).

**Complementario a `dsh-plugin-check`.** Las 36 comprobaciones del validador oficial verifican el *contrato y la calidad* de un plugin (esquema de configuración, registro de efectos, forma JSON de las herramientas); `plugin_vet` verifica la *cadena de suministro* de dónde proviene un plugin. Ejecuta ambos:

| | `dsh-plugin-check` (36 comprobaciones) | `plugin_vet` (este repo) |
|---|---|---|
| Pregunta respondida | ¿Está bien formado este plugin y cumple el contrato? | ¿Es seguro instalar este paquete? |
| Qué mira | Código del plugin, esquema, registros, contratos de herramientas | LICENSE, lockfile, refs de instalación/acciones, scripts de ciclo de vida, exfil/ofuscación, mantenimiento |
| Veredicto | Pasa/falla por comprobación | PASS / WARN / FAIL + puerta |
| Cuándo | Desarrollo o revisión de plugins | Antes de `dsh plugin add`, revisión de PR, puerta de CI de cadena de suministro |
| Bloqueante | Puerta de CI (no cero ante violaciones) | Configurable: `warn` (por defecto) o `deny` |

## Inicio rápido

El proveedor local de skills de DSH escanea cuatro raíces por rango — el rango menor gana los conflictos de nombre dentro de una capa:

| Rango | Raíz | Ámbito |
|---|---|---|
| 100 | `<repoRaíz>/.dsh/skills` | Por proyecto, viaja con el repo |
| 200 | `<repoRaíz>/.agents/skills` | Por proyecto, directorio de agentes compartido |
| 400 | `<dshHome>/skills` (`$DSH_HOME` o `~/.dsh`) | Por usuario, solo DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` o `~/.agents`) | Por usuario, entre agentes |

Rangos (el menor gana los conflictos de nombre dentro de una capa): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`. El rango custom 300 lo registra un plugin (como el `provider/` opcional de este pack), no es una raíz de disco.

Instalación con un comando (PowerShell, Windows):

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (defecto) | en
```

O con bash (macOS/Linux/CI):

```sh
bash ./scripts/install.sh --target user-agents --language en
```

O copia manual (ejemplo con PowerShell de Windows; cualquier shell sirve — usa `skills-en\` para la edición inglesa):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

El catálogo aparece en la siguiente sesión de DSH. Los cuerpos de las skills se recargan en caliente — edita `SKILL.md` y la siguiente carga con `skill` leerá el nuevo cuerpo; sin reiniciar. Desinstalar = ejecutar el instalador con `-Uninstall` / `--uninstall` (elimina exactamente lo que registró su manifiesto) o borrar los directorios copiados a mano.

Opcional: monta el paquete completo sin copiar mediante el plugin `provider/` — `language: zh|en` elige la edición (ver [provider/README.md](provider/README.md)). El proveedor está publicado en npm como [`@perrylink/dsh-skill-pack-security-provider`](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider): `dsh plugin add @perrylink/dsh-skill-pack-security-provider` lo monta con un comando.

## Qué hay dentro

| Ruta | Qué es |
|---|---|
| `skills/<nombre>/SKILL.md` | Las ocho skills (edición china); el frontmatter sigue el contrato oficial de `dsh-skill-filesystem` |
| `skills-en/<nombre>/SKILL.md` | Las ocho skills (edición inglesa); mismos nombres y metadatos que la edición china |
| `skills/<nombre>/references/` | Detalle con divulgación progresiva: matrices de comandos, tablas de triaje, plantillas |
| `scripts/install.ps1` | Instalador de Windows de un comando para las cuatro raíces (ambas ediciones de idioma); registra un manifiesto, soporta `-Uninstall`/`-DryRun`/`-Force` |
| `scripts/install.sh` | El equivalente POSIX (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | Bundle proveedor instalable por npm (declara `dsh.bundle`; embebe ambas ediciones en `pack/` vía `prepack`; `language: zh\|en`); registra el proveedor de skills Y la puerta `plugin_vet` vía `ctx.effect()`, falla en alto ante un `skillsDir` inválido |
| `provider/src/vet/` | El motor de escaneo `plugin_vet` sin dependencias (licencia / SBOM / bloqueo de commit / patrones maliciosos / informe de riesgo) |
| `package.json` | Manifest de bundle raíz: declara `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) y los datos de intake `dshWorkshop`, de modo que `dsh plugin add github:PerryLink/dsh-skill-pack-security` monta el pack a través del proveedor publicado |
| `verify/verify-skill-pack.mts` | Verificación headless contra el parser oficial, la herramienta `skill` real y el runtime de herramientas real — 25 comprobaciones sobre ambas ediciones |
| `VERSION` | Fuente única de versión; cada `metadata.version` de SKILL.md y `provider/package.json` debe coincidir con ella (aplicado por CI) |
| `docs/ecosystem-conflict-check.md` | Instantánea de conflictos de temas/nombres de GitHub en el ecosistema `dsh-plugin` |
| `docs/release-checklist.md` | Flujo de publicación: puntos de sincronización de versión, reglas de ediciones, etiquetado |
| `docs/improvement-plan.md` | El plan de mejora 1.2.0 con evidencia por ítem y criterios de aceptación |
| `docs/demos/` | Demos de `plugin_vet` contra tres repositorios reales (conforme / sin licencia / postinstall) más la repetición de la puerta deny — regeneradas con `docs/demos/run-demos.mjs` |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Historial de versiones, política de reporte de vulnerabilidades y reglas de contribución/verificación |
| `.github/workflows/verify.yml` | CI: verificación de 25 comprobaciones + ejercicio de install.sh/install.ps1 + build/pack del provider, en Ubuntu y Windows contra un commit fijado del harness; cada acción fijada a un SHA inmutable |
| `.github/dependabot.yml` | Actualizaciones semanales de dependencias para el provider y GitHub Actions |
| `LICENSE` | Apache License 2.0 |

## Verificación

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

Las mismas 25 comprobaciones se ejecutan en GitHub en cada push mediante `.github/workflows/verify.yml` (insignia arriba) — en Ubuntu y Windows — más un ejercicio de `install.sh`/`install.ps1` y un build/pack independiente del provider que comprueba que el tarball lleva ambas ediciones embebidas y el parche del bundle (`provider` job). El checkout del harness está fijado a un commit para una verificación reproducible, y cada acción del workflow está fijada a un SHA inmutable.

## Hoja de ruta

- `dsh-skill-pack-data-engineering` — pipelines de datos, calidad de datos, listas de verificación ETL (misma plantilla)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triaje de issues, flujos de mantenedor
- `dsh-skill-pack-performance` — metodología de profiling, criterios de benchmark, listas de regresión
- Más skills dentro de este pack (mismo límite de skill puro): `sbom-lifecycle` (flujos de generación/envejecimiento/importación de SBOM), `pen-test-review` (alcance de compromisos autorizados y revisión de informes; vuelve a comprobar la instantánea del ecosistema en busca de choques de nombre antes de publicar), `compliance-audit` (recorridos ASVS/NIST-CSF)
- Mantén frescos los artefactos de demo de `plugin_vet` (`docs/demos/run-demos.mjs`) y precisa la tabla de complementariedad con `dsh-plugin-check` a medida que el validador oficial añada comprobaciones

## Temas (Topics)

Si alojas este paquete en GitHub, configura los temas del repositorio: **`dsh`**, **`dsh-plugin`**, **`deepseek-harness`**, **`skill-pack`**, **`skills`**, **`security`**, **`security-audit`**, **`supply-chain`**, **`supply-chain-security`**, **`prompt-injection`**. Las insignias `dsh` / `dsh-plugin` de arriba reflejan esa identidad, y `provider/package.json` lleva los mismos valores en `keywords`.

## Límites

Sin herramienta de auditoría de seguridad de propósito general — `plugin_vet` es una puerta de confianza previa a la instalación, deliberadamente complementaria a los plugins escáner y al validador oficial `dsh-plugin-check`. Sin marketplace de skills, sin contenido copiado de skills de CC — formato compatible, contenido original.

## Contribuyentes

Gracias a todas las personas que han contribuido a este proyecto.

| Contribuyente | Contribuciones |
|---|---|
| [@PerryLink](https://github.com/PerryLink) | Autor y mantenedor — las ocho skills en ambas ediciones de idioma, instaladores, la suite de verificación, el bundle del proveedor, CI y documentación |

Tu nombre podría estar aquí — consulta [CONTRIBUTING.md](CONTRIBUTING.md) y abre un issue o un PR. Los nuevos contribuyentes se añaden a esta lista.

## Licencia

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Cubre tanto el contenido de las skills como el plugin proveedor opcional.
