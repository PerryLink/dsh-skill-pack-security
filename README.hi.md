<div align="center">

# dsh-skill-pack-security

**DeepSeek Harness के लिए आठ सुरक्षा-ऑडिट स्किल और एक स्वचालित प्लगइन सप्लाई-चेन गेट।**

*स्किल ऑडिट पद्धति सिखाती हैं; `plugin_vet` टूल प्री-इंस्टॉल स्कैन निष्पादित करता है — लाइसेंस / SBOM / कमिट पिनिंग / दुर्भावनापूर्ण पैटर्न / पाँच-आयामी जोखिम कार्ड।*

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

| सतह | स्थिति |
|---|---|
| Harness | DeepSeek Harness `0.1.0-rc.6` |
| Node | `^22.19.0 \|\| >=24.0.0` (DeepSeek Harness का runtime) |
| प्लेटफ़ॉर्म | सभी (स्किल सामग्री हैं; provider एक host प्लगइन है) |
| मॉडल | कोई भी (स्किल `skill` टूल से माँग पर लोड होती हैं; `plugin_vet` नियतात्मक है) |

## What you get

`dsh-skill-pack-security` DeepSeek Harness के लिए एक **स्किल पैक + सप्लाई-चेन गेट** है। यह आठ सुरक्षा पद्धतियों को `SKILL.md` बंडल के रूप में वितरित करता है जिन्हें मॉडल सत्र कैटलॉग में खोजता है और `skill` टूल से माँग पर लोड करता है, साथ में स्वचालित प्री-इंस्टॉल स्कैनर `plugin_vet`। **स्किल पद्धति सिखाती हैं; प्लगइन स्थैतिक जाँचें निष्पादित करता है।**

- **आठ स्किल, दो संस्करण** — हर स्किल `skills/` (चीनी) और `skills-en/` (अंग्रेज़ी) में समान नाम व मेटाडेटा के साथ वितरित होती है; हर root में एक भाषा स्थापित करें।
- **`plugin_vet` गेट** — वैकल्पिक `provider/` प्लगइन द्वारा `ctx.tools` पर पंजीकृत एक शून्य-निर्भरता स्कैनर (लाइसेंस / SBOM / कमिट पिनिंग / दुर्भावनापूर्ण पैटर्न / पाँच-आयामी जोखिम कार्ड)।
- **निष्कर्ष स्किल उद्धृत करते हैं** — हर निष्कर्ष संबंधित स्किल अनुभाग की ओर इंगित करता है (जैसे `supply-chain-review §1`) ताकि एजेंट मैनुअल ऑडिट जारी रख सके।
- **मॉडल द्वारा निष्पादन-योग्य** — हर स्किल चरण एक वास्तविक कमांड है (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) जिसमें अपेक्षित आउटपुट नमूना और एग्ज़िट-कोड कसौटी है।

## The eight skills

| स्किल | उद्देश्य | कब उपयोग करें |
|---|---|---|
| `security-audit` | पाँच-चरण ऑडिट प्रवाह: दायरा → इन्वेंट्री → जोखिम-स्तरीकरण → सत्यापन → रिपोर्ट टेम्पलेट | पूरे-रेपो ऑडिट, ऑडिट रिपोर्ट, योजना |
| `secret-scan` | क्रेडेंशियल ऑडिट: gitleaks/trivy उपयोग, गलत-सकारात्मक स्तर, रिडैक्टेड रिपोर्ट, समाधान-क्रम | सीक्रेट स्कैनिंग, अलर्ट ट्राइएज, लीक रिपोर्ट |
| `dependency-audit` | सप्लाई-चेन ऑडिट: pnpm/npm audit पठन, लाइसेंस, टाइपोस्क्वैट जोखिम, lockfile विचलन | डिपेंडेंसी समीक्षा, ऑडिट-रिपोर्ट व्याख्या |
| `supply-chain-review` | PR/नई-डिपेंडेंसी त्वरित समीक्षा: खतरनाक इंस्टॉल स्क्रिप्ट, टाइपोस्क्वैट, पुनरुत्पादनीय build | डिपेंडेंसी जोड़ने वाले PR की समीक्षा |
| `prompt-injection-review` | एजेंट परियोजनाओं की इंजेक्शन-सतह समीक्षा: AGENTS.md, स्किल, टूल विवरण, MCP, वेब | मॉडल-संदर्भ इंजेक्शन सतहों की समीक्षा |
| `threat-model` | डिज़ाइन-चरण थ्रेट मॉडलिंग: ट्रस्ट सीमाएँ, STRIDE तालिका, आक्रमण वृक्ष, शमन | नई सुविधाओं का मॉडलिंग, डिज़ाइन-चरण सुरक्षा समीक्षा |
| `vuln-intel` | भेद्यता खुफिया: NVD/CISA-KEV/GHSA/OSV खोज व निर्णय-कसौतियाँ | CVE/GHSA id मिलने पर प्रभाव व दोहन जाँच |
| `incident-response` | एजेंट-परिवेश घटना प्रतिक्रिया: रोकें → साक्ष्य → पुनर्प्राप्त करें → postmortem | DSH/एजेंट सेटअप में संदिग्ध सुरक्षा घटनाएँ |

हर बंडल अपनी मुख्य फ़ाइल ≤ 300 पंक्तियों में रखता है (प्रगतिशील प्रकटीकरण; विवरण `references/` में)।

## plugin_vet — the automated pre-install gate

`plugin_vet` पैक का स्वचालित पूरक है: `provider/` प्लगइन द्वारा `ctx.tools` पर पंजीकृत शून्य-निर्भरता स्कैनर। इसे GitHub `owner/repo` या स्थानीय पैकेज पथ पर इंगित करें — यह tarball एक बार डाउनलोड करता है (timeout + `AbortSignal` का सम्मान), बजट सीमाओं में स्कैन करता है और एक रेंडर कार्ड लौटाता है।

- **लाइसेंस स्कैन** — LICENSE फ़ाइल और `license` फ़ील्ड खोजता है; `NOASSERTION`/`UNKNOWN`/`SEE LICENSE IN <file>`, गायब फ़ाइल या गायब फ़ील्ड को चिह्नित किया जाता है; सामान्य SPDX id पहचाने जाते हैं।
- **SBOM** — lockfile (pnpm/npm/yarn) से संस्करण-सहित डिपेंडेंसी वृक्ष निकालता है।
- **कमिट लॉकिंग** — इंस्टॉल-मैनिफ़ेस्ट refs और workflow क्रियाएँ अपरिवर्तनीय 40-hex कमिट SHA होनी चाहिएँ; `@tag`/शाखा refs को परिवर्तनीय चिह्नित किया जाता है।
- **दुर्भावनापूर्ण पैटर्न** — lifecycle स्क्रिप्ट (`preinstall`/`install`/`postinstall`), नेटवर्क-निष्कासन डोमेन और अस्पष्ट/एन्कोडेड payload।
- **पाँच-आयामी जोखिम रिपोर्ट** — लाइसेंस / स्रोत / डिपेंडेंसी / build स्क्रिप्ट / रखरखाव, हर एक 0–100, समग्र निर्णय में जुड़ते हैं: PASS, WARN या FAIL।

**इंस्टॉल गेट।** निर्णय इंस्टॉलेशन गेट में जाता है — `gate.policy: warn` (डिफ़ॉल्ट, गैर-अवरोधक) FAIL पर चेतावनी छापता है; `gate.policy: deny` इंस्टॉलेशन रोकता है:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # plugin_vet में विफल इंस्टॉल रोकें
```

## Quick start

```sh
# 1. bundle को अपने profile में इंस्टॉल करें
dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"

# या npm से (प्रकाशित संस्करण)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. रीस्टार्ट करें और पंक्ति की पुष्टि करें
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

## Install & uninstall

- **git चैनल** (नवीनतम `main`): `dsh plugin --profile web add "github:PerryLink/dsh-skill-pack-security#main"` — provider bundle माउंट करता है; `prepack` दोनों संस्करण tarball में एम्बेड करता है।
- **npm चैनल** (प्रकाशित संस्करण): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`।
- **tarball चैनल**: `provider/` में `pnpm pack`, फिर `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`।
- **अनइंस्टॉल**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (या पंक्ति हटाएँ; शुद्ध-स्किल प्रतियाँ इंस्टॉलर के `-Uninstall` / `--uninstall` से हटती हैं)।

## Installing the skills by hand

DSH का स्थानीय स्किल प्रदाता चार roots को rank से स्कैन करता है (एक परत में समान-नाम विरोध में कम rank जीतता है):

| Rank | Root | दायरा |
|---|---|---|
| 100 | `<projectRoot>/.dsh/skills` | परियोजना-स्कोप, रेपो के साथ चलता है |
| 200 | `<projectRoot>/.agents/skills` | परियोजना-स्कोप, साझा एजेंट निर्देशिका |
| 400 | `<dshHome>/skills` (`$DSH_HOME` या `~/.dsh`) | उपयोगकर्ता-स्कोप, केवल DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` या `~/.agents`) | उपयोगकर्ता-स्कोप, क्रॉस-एजेंट |

Ranks (एक परत में समान-नाम विरोध में कम जीतता है): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`। custom rank 300 प्लगइन-पंजीकृत है (जैसे इस पैक का वैकल्पिक `provider/`), डिस्क root नहीं।

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (डिफ़ॉल्ट) | en
```

```sh
bash ./scripts/install.sh --target user-agents --language en
```

## Configuration

सभी ट्यूनेबल Schemastery `Config` फ़ील्ड हैं (cordis.yml से बदले जा सकते हैं)। `provider/cordis.patch.yml` हर कुंजी को इनलाइन दस्तावेज़ित करता है।

| कुंजी | डिफ़ॉल्ट | अर्थ |
|---|---|---|
| `language` | `zh` | प्रकाशित संस्करण: चीनी `skills/` या अंग्रेज़ी `skills-en/`; `skillsDir` सेट होने पर अनदेखा |
| `watch` | `false` | पैक की गई स्किल निर्देशिका पर नज़र (स्थैतिक सामग्री, इसलिए बंद) |
| `skillsDir` | *(अनसेट)* | स्पष्ट स्किल root; `language`-व्युत्पन्न डिफ़ॉल्ट को ओवरराइड करता है और `<skill>/SKILL.md` बंडल रखने चाहिए |
| `vet.enable` | `true` | `plugin_vet` गेट टूल पंजीकृत करें |
| `vet.timeoutMs` | `15000` | tarball-डाउनलोड timeout (ms) |
| `vet.maxFiles` | `800` | स्कैन फ़ाइल सीमा |
| `vet.maxFileBytes` | `262144` | प्रति-फ़ाइल बाइट सीमा |
| `vet.maxExtractBytes` | `67108864` | निष्कर्षण बाइट सीमा |
| `vet.maxDepNodes` | `600` | डिपेंडेंसी-वृक्ष नोड सीमा |
| `vet.maxFindingsPerCheck` | `12` | प्रति जाँच निष्कर्ष सीमा |
| `vet.userAgent` | `dsh-skill-pack-security/2.0.0 (+https://github.com/PerryLink/dsh-skill-pack-security)` | डाउनलोड user-agent |
| `vet.gate.policy` | `warn` | इंस्टॉल गेट: `warn` (गैर-अवरोधक) या `deny` (FAIL पर रोकें) |

## Tools & surfaces

| सतह | प्रकार | टिप्पणियाँ |
|---|---|---|
| `plugin_vet` | tool | प्री-इंस्टॉल सप्लाई-चेन स्कैन (लाइसेंस / SBOM / कमिट लॉक / दुर्भावनापूर्ण / जोखिम कार्ड); निष्कर्ष स्किल अनुभाग उद्धृत करते हैं |
| `skill-pack-security` | skill provider | पैक के `skills/` या `skills-en/` संस्करण को `ctx.skills` पर पंजीकृत करता है |
| आठ `SKILL.md` बंडल | skills | ऑडिट पद्धति, दो भाषा संस्करणों में |
| इंस्टॉल गेट | gate | `vet.gate.policy: warn \| deny` इंस्टॉलेशन निर्णय देता है |

## Permissions & data

- **अनुमतियाँ**: `dshWorkshop` manifest `files:read` और `network:fetch` घोषित करता है।
- **डेटा**: `plugin_vet` tarball एक बार डाउनलोड करता है (timeout + `AbortSignal` का सम्मान) और रिपोर्ट सीक्रेट-आकार वाले पाठ को रिडैक्ट करती हैं; प्लगइन कोई prompt खंड इंजेक्ट नहीं करता।

## Security boundaries

- **शून्य-निर्भरता इंजन।** `plugin_vet` केवल `node:` builtins और सापेक्ष imports उपयोग करता है।
- **संकीर्ण प्री-इंस्टॉल गेट।** सामान्य-उद्देश्य सुरक्षा-ऑडिट टूल नहीं — जान-बूझकर स्कैनर प्लगइनों और आधिकारिक `dsh-plugin-check` अनुबंध सत्यापक का पूरक।
- **डिफ़ॉल्ट रूप से गैर-अवरोधक।** इंस्टॉल गेट `warn` है जब तक आप `deny` न चुनें।
- **मौलिक सामग्री।** Claude Code स्किल प्रारूप के अनुकूल, पर कोई कॉपी की गई CC सामग्री नहीं और कोई स्किल मार्केटप्लेस नहीं।

## Verification

`verify/verify-skill-pack.mts` स्थानीय `deepseek-harness` checkout से **आधिकारिक** `dsh-skill-filesystem` पार्सर, **वास्तविक** `skill` टूल और **वास्तविक** टूल्स runtime आयात करता है और दोनों भाषा संस्करणों पर 25 जाँचें करता है: संरचना व frontmatter वैधता, आधिकारिक/सामुदायिक स्किलों से शून्य नाम-विरोध, `ctx.skills.get()` की पूर्ण लोडिंग, वास्तविक टूल्स runtime से `plugin_vet` का व्यवहार, शून्य-निर्भरता अपरिवर्तनीयता और रिपोर्ट रिडैक्शन। यही 25 जाँचें GitHub पर `.github/workflows/verify.yml` से चलती हैं (Ubuntu और Windows)।

## Known limitations

- **पूर्ण ऑडिट टूल नहीं।** `plugin_vet` एक संकीर्ण प्री-इंस्टॉल ट्रस्ट गेट है; यह शुरू-से-अंत मैनुअल ऑडिट नहीं बदल सकता।
- **केवल स्थैतिक स्कैन।** दुर्भावनापूर्ण-पैटर्न और रखरखाव संकेत वितरित पैकेज पर ह्यूरिस्टिक हैं, गतिशील विश्लेषण नहीं।
- **हर root में एक संस्करण।** एक root में समान-नाम स्किल rank से हल होती हैं, इसलिए एक सत्र कैटलॉग में केवल एक भाषा संस्करण आता है।

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # दोनों स्किल संस्करण tarball में एम्बेड करता है
tsx verify/verify-skill-pack.mts    # 25-जाँच headless सत्यापन
```

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — लेखक और अनुरक्षक: दोनों भाषा संस्करणों में आठ स्किल, इंस्टॉलर, सत्यापन सूट, provider बंडल, CI और दस्तावेज़ीकरण।

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
