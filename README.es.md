<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>Metodología de auditoría de seguridad para DeepSeek Harness — cinco skills de agente, cero código en tiempo de ejecución.</b><br/>
  escaneo de secretos · auditoría de dependencias · revisión de cadena de suministro · revisión de inyección de prompts · orquestación de auditorías
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
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Licencia: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="Tema: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="Tema: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-5-8257D0" alt="5 skills">
  <img src="https://img.shields.io/badge/verified-9%2F9%20checks-brightgreen" alt="Verificado: 9/9 comprobaciones">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="Idiomas: EN/ZH/ES/PT/HI">
</p>

---

## ¿Qué es esto?

Un **paquete de skills puro** para [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — el arnés de agentes «todo es un plugin» construido sobre [Cordis](https://github.com/cordiverse/cordis). Distribuye cinco metodologías de auditoría de seguridad como bundles `SKILL.md`: el modelo las descubre en su catálogo de sesión y carga el cuerpo a demanda con la herramienta `skill`.

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

## Las cinco skills

| Skill | Propósito en una línea | Cuándo usarla |
|---|---|---|
| `security-audit` | Flujo de auditoría en cinco fases: alcance → inventario → clasificación de riesgos → verificación → plantilla de informe | Auditorías de repo completo, informes, planificación |
| `secret-scan` | Auditoría de credenciales: uso de gitleaks/trivy, niveles de falsos positivos, informes redactados, orden de remediación | Escaneo de secretos, triaje de alertas, informes de fugas |
| `dependency-audit` | Auditoría de cadena de suministro: lectura de pnpm/npm audit, licencias, riesgo de typosquat, deriva del lockfile | Revisión de dependencias, interpretación de informes de auditoría |
| `supply-chain-review` | Revisión rápida de PR/nuevas dependencias: scripts de instalación peligrosos, typosquat, builds reproducibles | Revisar PRs que añaden dependencias |
| `prompt-injection-review` | Revisión de superficies de inyección en proyectos de agentes: AGENTS.md, skills, descripciones de herramientas, MCP, web | Revisar superficies de inyección del contexto del modelo |

Cada bundle: archivo principal ≤ 300 líneas (divulgación progresiva; los detalles viven en `references/`), `description` autocontenida sobre «cuándo usarla / cuándo no», y `whenToUse` con disparadores precisos.

## Inicio rápido

El proveedor local de skills de DSH escanea cuatro raíces por rango — el rango menor gana los conflictos de nombre dentro de una capa:

| Rango | Raíz | Ámbito |
|---|---|---|
| 100 | `<repoRaíz>/.dsh/skills` | Por proyecto, viaja con el repo |
| 200 | `<repoRaíz>/.agents/skills` | Por proyecto, directorio de agentes compartido |
| 400 | `<dshHome>/skills` (`$DSH_HOME` o `~/.dsh`) | Por usuario, solo DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` o `~/.agents`) | Por usuario, entre agentes |

Instalación con un comando (PowerShell):

```powershell
./scripts/install.ps1 -Target user-agents   # o: project-dsh | project-agents | user-dsh
```

O copia manual (ejemplo con PowerShell de Windows; cualquier shell sirve):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

El catálogo aparece en la siguiente sesión de DSH. Los cuerpos de las skills se recargan en caliente — edita `SKILL.md` y la siguiente carga con `skill` leerá el nuevo cuerpo; sin reiniciar. Desinstalar = borrar los directorios copiados.

Opcional: monta el paquete completo sin copiar mediante el plugin `provider/` (ver [provider/README.md](provider/README.md)).

## Qué hay dentro

| Ruta | Qué es |
|---|---|
| `skills/<nombre>/SKILL.md` | Las cinco skills; el frontmatter sigue el contrato oficial de `dsh-skill-filesystem` |
| `skills/<nombre>/references/` | Detalle con divulgación progresiva: matrices de comandos, tablas de triaje, plantillas |
| `scripts/install.ps1` | Instalador de un comando para las cuatro raíces |
| `provider/` | Plugin proveedor opcional (demo de empaquetado, registrado vía `ctx.effect()`) |
| `verify/verify-skill-pack.mts` | Verificación headless contra el parser oficial y la herramienta `skill` real |
| `docs/ecosystem-conflict-check.md` | Instantánea de conflictos de temas/nombres de GitHub en el ecosistema `dsh-plugin` |
| `.github/workflows/verify.yml` | CI: instala el harness y ejecuta las 9 comprobaciones en cada push |
| `LICENSE` | Apache License 2.0 |

## Verificación

`verify/verify-skill-pack.mts` importa el parser **oficial** `dsh-skill-filesystem` y la herramienta **real** `skill` desde un checkout local de `deepseek-harness` y comprueba 9 conjuntos de aserciones:

1. Estructura: 5 bundles de directorio, sin md planos sueltos, `name` del frontmatter coincide con el directorio, ≤ 300 líneas, `references/` conectado
2. Sin conflictos de nombre con las 12 skills oficiales de `.agents/skills/` ni con paquetes de skills comunitarios conocidos
3. Las 5 skills descubiertas por el proveedor oficial
4. `ctx.skills.get()` carga todos los cuerpos, metadatos y política de invocación
5. La herramienta `skill` real devuelve `<skill_content>` para las 5 skills; nombres desconocidos/inválidos rechazados
6. El catálogo de sesión contiene solo `name` + `description` — `whenToUse` queda fuera del catálogo del modelo (diseño oficial)
7. 13 fixtures de frontmatter inválido ejercitan las reglas oficiales fail-closed (campos faltantes, claves camel-case heredadas, valores no booleanos, nombres no kebab, directorios anidados, desajuste de nombre)
8. Las skills en archivo plano cargan; el anidado `**/SKILL.md` no se descubre
9. El plugin proveedor opcional se monta vía `ctx.effect()` y se desmonta limpiamente

```powershell
# local: resuelve automáticamente el checkout del harness junto al pack, o apúntalo explícitamente
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 9 checks passed for dsh-skill-pack-security.
```

Las mismas 9 comprobaciones también se ejecutan en GitHub en cada push mediante `.github/workflows/verify.yml` (insignia arriba).

## Hoja de ruta

- `dsh-skill-pack-data-engineering` — pipelines de datos, calidad de datos, listas de verificación ETL (misma plantilla)
- `dsh-skill-pack-oss-collab` — etiqueta de PR, triaje de issues, flujos de mantenedor
- `dsh-skill-pack-performance` — metodología de profiling, criterios de benchmark, listas de regresión
- Opcional: empaquetar el pack como proveedor de badge integrado al estilo de `dsh-skill-badge`

## Temas (Topics)

Si alojas este paquete en GitHub, configura los temas del repositorio: **`dsh`**, **`dsh-plugin`** — más `skill-pack`, `security-audit`, `supply-chain-security`, `prompt-injection`. Las insignias `dsh` / `dsh-plugin` de arriba reflejan esa identidad, y `provider/package.json` lleva los mismos valores en `keywords`.

## Límites

Sin plugin de auditoría de seguridad tipo herramienta (deliberadamente complementario a los escáneres), sin marketplace de skills, sin contenido copiado de skills de CC — formato compatible, contenido original.

## Licencia

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors. Cubre tanto el contenido de las skills como el plugin proveedor opcional.
