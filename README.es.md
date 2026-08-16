<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Metodología de auditoría de seguridad para DeepSeek Harness — ocho skills de agente, cero código en tiempo de ejecución.</b><br/>
  escaneo de secretos · auditoría de dependencias · revisión de cadena de suministro · revisión de inyección de prompts · orquestación de auditorías · modelado de amenazas · inteligencia de vulnerabilidades · respuesta a incidentes
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
  <img src="https://img.shields.io/badge/verified-19%2F19%20checks-brightgreen" alt="Verificado: 19/19 comprobaciones">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Idiomas: EN/ZH/ES/PT/HI">
</p>

---

## ¿Qué es esto?

Un **paquete de skills puro** para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — el arnés de agentes «todo es un plugin» construido sobre [Cordis](https://github.com/cordiverse/cordis). Distribuye ocho metodologías de seguridad como bundles `SKILL.md`: el modelo las descubre en su catálogo de sesión y carga el cuerpo a demanda con la herramienta `skill`.

> Repositorio: https://github.com/PerryLink/dsh-skill-pack-security

**Cero código en tiempo de ejecución.** No registra herramientas, no registra servicios, no cambia el comportamiento de la sesión. El único ejecutable es el plugin opcional `provider/` — una demo de empaquetado — y el paquete funciona igual sin él.

Cada skill es **ejecutable por un modelo**: cada paso es un comando real (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) con una muestra de salida esperada, un criterio de código de salida y criterios de falsos positivos. Sin afirmaciones no verificables.

## ¿Por qué skills y no herramientas?

| Forma | Qué hace | Qué no puede hacer |
|---|---|---|
| Plugin de herramientas (p. ej. escáneres) | **Ejecuta** escaneos, devuelve hallazgos | Interpretar alertas, clasificar falsos positivos, redactar informes |
| Capa de protocolo | **Restringe** un protocolo | Generalizar entre repos y agentes |
| **Paquete de skills (este repo)** | **Enseña metodología**: triaje, informes, orden de remediación | Ejecutar escaneos por sí mismo |

Instalado junto a un plugin de seguridad tipo herramienta, ambos se complementan: la herramienta ejecuta el escaneo, la skill dirige la interpretación, el triaje y el informe — el modelo sigue la metodología de este paquete mientras llama a las herramientas del plugin.

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
| `provider/` | Bundle proveedor opcional instalable por npm (declara `dsh.bundle`; embebe ambas ediciones en `pack/` vía `prepack`; `language: zh\|en`); registrado vía `ctx.effect()`, falla en alto ante un `skillsDir` inválido |
| `package.json` | Manifest de bundle raíz: declara `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) y los datos de intake `dshWorkshop`, de modo que `dsh plugin add github:PerryLink/dsh-skill-pack-security` monta el pack a través del proveedor publicado |
| `verify/verify-skill-pack.mts` | Verificación headless contra el parser oficial y la herramienta `skill` real — 19 comprobaciones sobre ambas ediciones |
| `VERSION` | Fuente única de versión; cada `metadata.version` de SKILL.md y `provider/package.json` debe coincidir con ella (aplicado por CI) |
| `docs/ecosystem-conflict-check.md` | Instantánea de conflictos de temas/nombres de GitHub en el ecosistema `dsh-plugin` |
| `docs/release-checklist.md` | Flujo de publicación: puntos de sincronización de versión, reglas de ediciones, etiquetado |
| `docs/improvement-plan.md` | El plan de mejora 1.2.0 con evidencia por ítem y criterios de aceptación |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | Historial de versiones, política de reporte de vulnerabilidades y reglas de contribución/verificación |
| `.github/workflows/verify.yml` | CI: verificación de 19 comprobaciones + ejercicio de install.sh/install.ps1 + build/pack del provider, en Ubuntu y Windows contra un commit fijado del harness |
| `.github/dependabot.yml` | Actualizaciones semanales de dependencias para el provider y GitHub Actions |
| `LICENSE` | Apache License 2.0 |

## Verificación

`verify/verify-skill-pack.mts` importa el parser **oficial** `dsh-skill-filesystem` y la herramienta **real** `skill` desde un checkout local de `deepseek-harness` y ejecuta 19 comprobaciones sobre ambas ediciones de idioma:

1. Estructura: ambas ediciones presentes, 8 bundles de directorio en cada edición, sin skills planas sueltas, `name` del frontmatter coincide con el directorio, ≤ 300 líneas, `references/` conectado, `metadata.version` sincronizado con el archivo `VERSION`
2. Sin conflictos de nombre con las skills oficiales de `.agents/skills/` (derivadas del checkout en tiempo de ejecución) ni con paquetes de skills comunitarios conocidos
3–6. Por edición (china `skills/`, inglesa `skills-en/`): descubrimiento por el registro a través del proveedor oficial, cargas completas vía `ctx.skills.get()`, la herramienta `skill` real devolviendo `<skill_content>` (nombres desconocidos/inválidos rechazados), y el catálogo de sesión conteniendo solo `name` + `description` — `whenToUse` queda fuera del catálogo del modelo (diseño oficial)
7. 13 fixtures de frontmatter inválido ejercitan las reglas oficiales fail-closed (campos faltantes, claves camel-case heredadas, valores no booleanos, nombres no kebab, directorios anidados, desajuste de nombre); las skills en archivo plano cargan y el anidado `**/SKILL.md` no se descubre
8. El plugin proveedor opcional monta la edición china y la inglesa vía `ctx.effect()`, se desmonta limpiamente y rechaza la mala configuración (`skillsDir` vacío o inexistente)
9–15. Comprobaciones de auto-endurecimiento: paridad estructural zh↔en, cableado de referencias (sin archivos colgantes/huérfanos), sincronización de versión del provider, rangos de raíces de skills documentados frente a las constantes oficiales, patrones `grep -E` portables a POSIX, auto-comprobación de secretos, lista de verificación de publicación segura en UTF-8

```powershell
# local: resuelve automáticamente el checkout del harness junto al pack, o apúntalo explícitamente
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 19 checks passed for dsh-skill-pack-security.
```

Las mismas 19 comprobaciones se ejecutan en GitHub en cada push mediante `.github/workflows/verify.yml` (insignia arriba) — en Ubuntu y Windows — más un ejercicio de `install.sh`/`install.ps1` y un build/pack independiente del provider que comprueba que el tarball lleva ambas ediciones embebidas y el parche del bundle (`provider` job). El checkout del harness está fijado a un commit para una verificación reproducible.

## Hoja de ruta

- `dsh-skill-pack-data-engineering` — pipelines de datos, calidad de datos, listas de verificación ETL (misma plantilla)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triaje de issues, flujos de mantenedor
- `dsh-skill-pack-performance` — metodología de profiling, criterios de benchmark, listas de regresión
- Más skills dentro de este pack (mismo límite de skill puro): `sbom-lifecycle` (flujos de generación/envejecimiento/importación de SBOM), `pen-test-review` (alcance de compromisos autorizados y revisión de informes; vuelve a comprobar la instantánea del ecosistema en busca de choques de nombre antes de publicar), `compliance-audit` (recorridos ASVS/NIST-CSF)
- Bundle del proveedor publicado en npm como `@perrylink/dsh-skill-pack-security-provider` (listo para `dsh plugin add`); mantenlo sincronizado con cada versión mediante `docs/release-checklist.md`

## Temas (Topics)

Si alojas este paquete en GitHub, configura los temas del repositorio: **`dsh`**, **`dsh-plugin`**, **`deepseek-harness`**, **`skill-pack`**, **`skills`**, **`security`**, **`security-audit`**, **`supply-chain`**, **`supply-chain-security`**, **`prompt-injection`**. Las insignias `dsh` / `dsh-plugin` de arriba reflejan esa identidad, y `provider/package.json` lleva los mismos valores en `keywords`.

## Límites

Sin plugin de auditoría de seguridad tipo herramienta (deliberadamente complementario a los escáneres), sin marketplace de skills, sin contenido copiado de skills de CC — formato compatible, contenido original.

## Contribuyentes

Gracias a todas las personas que han contribuido a este proyecto.

| Contribuyente | Contribuciones |
|---|---|
| [@PerryLink](https://github.com/PerryLink) | Autor y mantenedor — las ocho skills en ambas ediciones de idioma, instaladores, la suite de verificación, el bundle del proveedor, CI y documentación |

Tu nombre podría estar aquí — consulta [CONTRIBUTING.md](CONTRIBUTING.md) y abre un issue o un PR. Los nuevos contribuyentes se añaden a esta lista.

## Licencia

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Cubre tanto el contenido de las skills como el plugin proveedor opcional.
