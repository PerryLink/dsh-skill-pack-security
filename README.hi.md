<div align="center">

# dsh-skill-pack-security
- **1024 स्टोर चैनल**: एक बार `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add dsh-skill-pack-security` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

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
| Harness | DeepSeek Harness `0.1.2-alpha.5` (2026-09-02 को अनुकूलित): सत्र लिफ़ाफ़ा अपना ignorable फ़ील्ड केवल संग्रहीत-लॉग पठन संगतता के लिए रखता है - Session.append अभी भी इसे स्टैम्प नहीं कर सकता, इसलिए गेट व्यवहार अपरिवर्तित है। |
| Node | `^22.19.0 \|\| >=24.0.0` (DeepSeek Harness का runtime) |
| प्लेटफ़ॉर्म | सभी (स्किल सामग्री हैं; provider एक host प्लगइन है) |
| मॉडल | कोई भी (स्किल `skill` टूल से माँग पर लोड होती हैं; `plugin_vet` नियतात्मक है) |

## What you get

`dsh-skill-pack-security` DeepSeek Harness के लिए एक **स्किल पैक + सप्लाई-चेन गेट** है। यह आठ सुरक्षा पद्धतियों को `SKILL.md` बंडल के रूप में वितरित करता है जिन्हें मॉडल सत्र कैटलॉग में खोजता है और `skill` टूल से माँग पर लोड करता है, साथ में स्वचालित प्री-इंस्टॉल स्कैनर `plugin_vet`। **स्किल पद्धति सिखाती हैं; प्लगइन स्थैतिक जाँचें निष्पादित करता है।**

- **आठ स्किल, दो संस्करण** — हर स्किल `skills/` (चीनी) और `skills-en/` (अंग्रेज़ी) में समान नाम व मेटाडेटा के साथ वितरित होती है; हर root में एक भाषा स्थापित करें।
- **`plugin_vet` गेट** — वैकल्पिक `provider/` प्लगइन द्वारा `ctx.tools` पर पंजीकृत एक शून्य-निर्भरता स्कैनर (लाइसेंस / SBOM / कमिट पिनिंग / दुर्भावनापूर्ण पैटर्न / डेटा-जिम्मेदारी समीक्षा / पाँच-आयामी जोखिम कार्ड)।
- **निष्कर्ष स्किल उद्धृत करते हैं** — हर निष्कर्ष संबंधित स्किल अनुभाग की ओर इंगित करता है (जैसे `supply-chain-review §1`) ताकि एजेंट मैनुअल ऑडिट जारी रख सके।
- **मॉडल द्वारा निष्पादन-योग्य** — हर स्किल चरण एक वास्तविक कमांड है (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) जिसमें अपेक्षित आउटपुट नमूना और एग्ज़िट-कोड कसौटी है।

## Why skills, not tools?

| रूप | क्या करता है | क्या नहीं कर सकता |
|---|---|---|
| टूल प्लगइन (जैसे स्कैनर) | स्कैन **निष्पादित** करता है, निष्कर्ष लौटाता है | अलर्ट की व्याख्या, गलत-सकारात्मक का वर्गीकरण, रिडैक्टेड रिपोर्ट लिखना |
| प्रोटोकॉल परत | किसी प्रोटोकॉल को **बाधित** करता है | रेपो और एजेंटों के बीच सामान्यीकरण |
| **स्किल पैक (यह रेपो)** | **पद्धति सिखाता है**: ट्राइएज, रिपोर्ट, समाधान-क्रम — **और** `plugin_vet` से प्री-इंस्टॉल स्थैतिक जाँचें स्वचालित करता है | मैनुअल ऑडिट को शुरू से अंत तक बदलना |

टूल-प्रकार के सुरक्षा प्लगइन के साथ स्थापित करने पर दोनों मिलकर काम करते हैं: टूल स्कैन चलाता है, स्किल व्याख्या, ट्राइएज और रिपोर्ट को दिशा देती है। यह पैक दोनों रूपों को जोड़ता है: स्किल पद्धति सिखाती हैं और `plugin_vet` यांत्रिक स्थैतिक उपसमुच्चय को स्वतः चलाता है, हर निष्कर्ष वापस स्किलों की ओर इंगित करता है।

Claude Code इकोसिस्टम की 3000+ स्किल इस रूप के वितरण-मूल्य को सिद्ध करती हैं। DSH का `SKILL.md` फ्रंटमैटर (`name`, `description`, `whenToUse`) CC स्किल प्रारूप के अनुकूल है; यह पैक केवल साझा उपसमुच्चय का उपयोग करता है और इसकी सामग्री पूर्णतः मौलिक है।

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
- **डेटा-जिम्मेदारी समीक्षा** — नीति-स्कैन आयामों के नियतात्मक नियम: संवेदनशील सीमों (`agent/pre-step`, `tools/pre-execute`, `session/event` आदि) पर बिना गेटिंग के श्रोता, README में बिना खुलासे के बाहरी एंडपॉइंट, विवरण-व्यवहार कीवर्ड कवरेज, और शिप किए गए पाठ में एम्बेडेड निर्देश-अधिलेखन पेलोड। हर निष्कर्ष मैनुअल गहन समीक्षा के लिए `prompt-injection-review` की ओर संकेत करता है; `vet.dataResponsibility: false` से प्रति-तैनाती बंद किया जा सकता है।
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

**`dsh-plugin-check` का पूरक।** आधिकारिक प्लगइन सत्यापक की 36 जाँचें एक प्लगइन के *अनुबंध और गुणवत्ता* की पुष्टि करती हैं (कॉन्फ़िगरेशन स्कीमा, effect पंजीकरण, टूल JSON आकार); `plugin_vet` इसकी *सप्लाई चेन* सत्यापित करता है कि प्लगइन कहाँ से आता है। दोनों चलाएँ:

| | `dsh-plugin-check` (36 जाँचें) | `plugin_vet` (यह रेपो) |
|---|---|---|
| उत्तरित प्रश्न | क्या यह प्लगइन सुगठित और अनुबंध-अनुरूप है? | क्या यह पैकेज इंस्टॉल करना सुरक्षित है? |
| क्या देखता है | प्लगइन कोड, स्कीमा, पंजीकरण, टूल अनुबंध | LICENSE, lockfile, इंस्टॉल refs/क्रियाएँ, lifecycle स्क्रिप्ट, exfil/obfuscation, रखरखाव, डेटा-जिम्मेदारी (हुक दायरा, टेलीमेट्री खुलासा, विवरण-व्यवहार, एम्बेडेड पेलोड) |
| निर्णय | प्रति जाँच पास/फेल | PASS / WARN / FAIL + गेट |
| कब | प्लगइन विकास या समीक्षा | `dsh plugin add` से पहले, PR समीक्षा, CI सप्लाई-चेन गेट |
| अवरोधक | CI गेट (उल्लंघन पर गैर-शून्य) | कॉन्फ़िगर करने योग्य: `warn` (डिफ़ॉल्ट) या `deny` |

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

## What's inside

| पथ | क्या है |
|---|---|
| `skills/<name>/SKILL.md` | आठ स्किल (चीनी संस्करण); frontmatter आधिकारिक `dsh-skill-filesystem` अनुबंध का पालन करता है |
| `skills-en/<name>/SKILL.md` | आठ स्किल (अंग्रेज़ी संस्करण); चीनी संस्करण जैसे नाम व मेटाडेटा |
| `skills/<name>/references/` | प्रगतिशील-प्रकटीकरण विवरण: कमांड मैट्रिक्स, ट्राइएज तालिकाएँ, टेम्पलेट |
| `scripts/install.ps1` | चारों roots (दोनों भाषा संस्करण) के लिए एक-कमांड Windows इंस्टॉलर; manifest रिकॉर्ड करता है, `-Uninstall`/`-DryRun`/`-Force` समर्थन |
| `scripts/install.sh` | POSIX समकक्ष (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | npm-इंस्टॉल योग्य provider बंडल (`dsh.bundle` घोषित; `prepack` से दोनों संस्करण `pack/` में एम्बेड; `language: zh\|en`); `ctx.effect()` से स्किल प्रदाता **और** `plugin_vet` गेट टूल पंजीकृत करता है, खराब `skillsDir` पर ज़ोर से विफल |
| `provider/src/vet/` | शून्य-निर्भरता `plugin_vet` स्कैन इंजन (लाइसेंस / SBOM / कमिट लॉक / दुर्भावनापूर्ण पैटर्न / जोखिम रिपोर्ट) |
| `package.json` | रूट बंडल manifest: `dsh.bundle.patch` (→ `provider/cordis.patch.yml`) और `dshWorkshop` intake तथ्य घोषित |
| `verify/verify-skill-pack.mts` | आधिकारिक parser, वास्तविक `skill` टूल और वास्तविक टूल्स runtime के विरुद्ध headless सत्यापन — दोनों संस्करणों में 25 जाँचें |
| `VERSION` | संस्करण का एकल स्रोत; हर SKILL.md का `metadata.version` और `provider/package.json` उससे मेल खाना चाहिए (CI-लागू) |
| `docs/` | इकोसिस्टम संघर्ष जाँच, प्रकाशन सूची, सुधार योजनाएँ और `plugin_vet` डेमो |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | रिलीज़ इतिहास, भेद्यता रिपोर्ट नीति, योगदान/सत्यापन नियम |
| `.github/workflows/verify.yml` | CI: 25-जाँच सत्यापन + इंस्टॉलर अभ्यास + provider build/pack स्मोक (Ubuntu और Windows) |
| `.github/dependabot.yml` | provider और GitHub Actions के साप्ताहिक डिपेंडेंसी अपडेट |
| `LICENSE` | Apache License 2.0 |
| `THIRD_PARTY_NOTICES.md` | तृतीय-पक्ष स्थिति: शून्य-निर्भरता इंजन, मूल्यांकित-पर-अपोर्टेड संपत्तियाँ, peer निर्भरता लाइसेंस |

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
| `vet.dataResponsibility` | `true` | डेटा-ज़िम्मेदारी समीक्षा चलाएँ (तैनाती अनुसार अक्षम करने योग्य) |
| `vet.externalScanners` | `true` | जब उनके CLI मौजूद हों तो `osv-scanner`/`npm audit` का संचालन करें; `false` अंतर्निहित स्व-गणित निर्भरता स्कैन बाध्य करता है |
| `vet.userAgent` | `dsh-skill-pack-security/2.2.3 (+https://github.com/PerryLink/dsh-skill-pack-security)` | डाउनलोड user-agent |
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
- **मौलिक इंजन, कोई तृतीय-पक्ष पोर्ट नहीं।** लाइसेंस स्कैन और दुर्भावनापूर्ण-पैटर्न जाँच मौलिक शून्य-निर्भरता कार्यान्वयन हैं; GPL-Radar / LLM-detective / Sus-PY संपत्तियों का पोर्ट के लिए मूल्यांकन किया गया पर कोई लाइसेंस-युक्त सार्वजनिक स्रोत नहीं मिला — `THIRD_PARTY_NOTICES.md` देखें।

## Verification

`verify/verify-skill-pack.mts` स्थानीय `deepseek-harness` checkout से **आधिकारिक** `dsh-skill-filesystem` parser, **वास्तविक** `skill` टूल और **वास्तविक** टूल्स runtime आयात करता है और दोनों भाषा संस्करणों पर 25 जाँचें करता है:

1. संरचना: दोनों संस्करण मौजूद, हर संस्करण में 8 निर्देशिका बंडल, कोई अतिरिक्त फ्लैट स्किल नहीं, frontmatter `name` निर्देशिका से मेल, ≤ 300 पंक्तियाँ, `references/` जुड़ा, `metadata.version` `VERSION` फ़ाइल से सिंक
2. आधिकारिक `.agents/skills/` स्किलों (रनटाइम पर checkout से व्युत्पन्न) या ज्ञात सामुदायिक स्किल पैकों से शून्य नाम-विरोध
3–6. प्रति संस्करण (चीनी `skills/`, अंग्रेज़ी `skills-en/`): आधिकारिक provider से रजिस्ट्री खोज, `ctx.skills.get()` से पूर्ण लोडिंग, वास्तविक `skill` टूल `<skill_content>` लौटाता है (अज्ञात/अमान्य नाम अस्वीकृत), और सत्र कैटलॉग में केवल `name` + `description` — `whenToUse` मॉडल कैटलॉग से बाहर (आधिकारिक डिज़ाइन)
7. 13 खराब-frontmatter fixtures आधिकारिक fail-closed नियमों का अभ्यास करते हैं (गायब फ़ील्ड, लेगेसी camel-case कुंजियाँ, गैर-बूलियन मान, गैर-kebab नाम, नेस्टेड निर्देशिकाएँ, नाम बेमेल); फ्लैट-फ़ाइल स्किल लोड होती हैं और नेस्टेड `**/SKILL.md` नहीं खोजा जाता
8. वैकल्पिक provider प्लगइन `ctx.effect()` से चीनी और अंग्रेज़ी संस्करण माउंट करता है, साफ़ dispose होता है, और गलत कॉन्फ़िगरेशन (खाली/अनुपस्थित `skillsDir`) अस्वीकार करता है
9–15. स्व-सख़्ती जाँचें: zh↔en संरचनात्मक समता, references जुड़ाव (कोई लटकती/अनाथ फ़ाइल नहीं), provider संस्करण सिंक, आधिकारिक स्थिरांकों के विरुद्ध दस्तावेज़ीकृत स्किल-root ranks, POSIX-पोर्टेबल `grep -E` पैटर्न, सीक्रेट स्व-जाँच, UTF-8-सुरक्षित प्रकाशन सूची
16–19. वास्तविक टूल्स runtime से `plugin_vet`: यह `ctx.tools` पर पंजीकृत होता है; अनुरूप fixture पास; बिना-लाइसेंस fixture विफल और `dependency-audit §3` उद्धृत; दुर्भावनापूर्ण postinstall fixture विफल (स्क्रिप्ट/exfil/obfuscation, `supply-chain-review §1` उद्धृत); `policy: deny` के तहत गेट इंस्टॉल रोकता है
20. स्कैन इंजन शून्य-निर्भरता (केवल `node:` builtins और सापेक्ष imports)
21. रिपोर्ट रिडैक्शन सीक्रेट-आकार वाले पाठ को रेंडर आउटपुट से बाहर रखता है

```powershell
# स्थानीय: पैक के पास harness checkout को स्वतः हल करता है, या स्पष्ट रूप से इंगित करें
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 25 checks passed for dsh-skill-pack-security.
```

यही 25 जाँचें GitHub पर हर push पर `.github/workflows/verify.yml` से चलती हैं — Ubuntu और Windows पर — साथ में `install.sh`/`install.ps1` अभ्यास और provider का स्वतंत्र build/pack स्मोक जो सुनिश्चित करता है कि tarball दोनों एम्बेडेड संस्करण और बंडल patch ले जाता है।

## Known limitations

- **पूर्ण ऑडिट टूल नहीं।** `plugin_vet` एक संकीर्ण प्री-इंस्टॉल ट्रस्ट गेट है; यह शुरू-से-अंत मैनुअल ऑडिट नहीं बदल सकता।
- **केवल स्थैतिक स्कैन।** दुर्भावनापूर्ण-पैटर्न और रखरखाव संकेत वितरित पैकेज पर ह्यूरिस्टिक हैं, गतिशील विश्लेषण नहीं।
- **हर root में एक संस्करण।** एक root में समान-नाम स्किल rank से हल होती हैं, इसलिए एक सत्र कैटलॉग में केवल एक भाषा संस्करण आता है।

## Roadmap

- `dsh-skill-pack-data-engineering` — डेटा पाइपलाइन, डेटा गुणवत्ता, ETL चेकलिस्ट (समान टेम्पलेट)
- `dsh-skill-pack-oss-collab` — PR शिष्टाचार, issue ट्राइएज, अनुरक्षक कार्यप्रवाह
- `dsh-skill-pack-performance` — profiling पद्धति, बेंचमार्क कसौतियाँ, रिग्रेशन चेकलिस्ट
- इस पैक में और स्किल (समान शुद्ध-स्किल सीमा): `sbom-lifecycle` (SBOM निर्माण/आयु/आयात कार्यप्रवाह), `pen-test-review` (अधिकृत जुड़ाव का दायरा और रिपोर्ट समीक्षा), `compliance-audit` (ASVS/NIST-CSF वॉकथ्रू)
- `plugin_vet` डेमो आर्टिफ़ैक्ट ताज़ा रखें (`docs/demos/run-demos.mjs`) और `dsh-plugin-check` पूरक तालिका सटीक रखें

## Development

```sh
pnpm --dir provider run typecheck   # tsc --noEmit
pnpm --dir provider run build       # tsc --noEmitOnError
pnpm --dir provider run prepack     # दोनों स्किल संस्करण tarball में एम्बेड करता है
tsx verify/verify-skill-pack.mts    # 25-जाँच headless सत्यापन
```

### Benchmark

पॉइज़न-सैंपल रिग्रेशन सेट (38 नमूनों पर प्रति-वर्ग पहचान दर / FPR / F1, साथ ही OSV/Socket से अंतर) [`benchmark/RESULTS.md`](benchmark/RESULTS.md) में है; `pnpm --dir provider run build && node benchmark/run.mjs` से दोबारा बनाएँ (कोई नई निर्भरता नहीं)।

## Topics

`dsh`, `dsh-plugin`, `deepseek-harness`, `skill-pack`, `skills`, `security`, `security-audit`, `supply-chain`, `supply-chain-security`, `prompt-injection`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — लेखक और अनुरक्षक: दोनों भाषा संस्करणों में आठ स्किल, इंस्टॉलर, सत्यापन सूट, provider बंडल, CI और दस्तावेज़ीकरण।

## PerryLink DSH Plugin Family

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) द्वारा अनुरक्षित [33 DeepSeek Harness प्लगइनों](https://github.com/PerryLink) में से एक है। अगर यह आपकी मदद करता है, तो बाकी भी करेंगे:

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | अनुमोदन श्रृंखला पर द्वितीय-मॉडल स्वतः-समीक्षा, डिफ़ॉल्ट रूप से विफल-बंद | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | वेब UI साइडबार, संदेश और अवरोधन के साथ टिकाऊ पृष्ठभूमि चाइल्ड एजेंट | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | DeepSeek Harness के लिए लागत प्रशासन: बजट, कार्बन और विलंबता एक पैनल में। | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Claude Code /rewind-समतुल्य: स्नैपशॉट, सत्र फ़ॉर्क, एक-बार पुनर्स्थापना | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | Claude Code सत्र, मेमोरी, कौशल और CLAUDE.md को DSH में स्थानांतरित करें | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | DeepSeek Harness के लिए क्रॉस-प्लेटफ़ॉर्म नेटिव डेस्कटॉप नियंत्रण — Windows पहले। | |
| **[dsh-dsh-composer-history](https://github.com/PerryLink/dsh-dsh-composer-history)** | वेब कंपोज़र के लिए टर्मिनल-शैली इनपुट इतिहास: तीर, Ctrl+R खोज | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | डेटासेट गुणवत्ता जाँच व उद्धरण सत्यापन (यहाँ उपभोग किया गया वैकल्पिक संख्या-सेतु) | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | DeepSeek Harness के लिए प्रॉम्प्ट-इंजेक्शन, जेलब्रेक और सीक्रेट-लीक रक्षा। | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | इंजीनियरिंग-अनुशासन रक्षक: आवश्यकताओं की पूछताछ, परीक्षण द्वार, प्रतिद्वंद्वी समीक्षा | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | DeepSeek Harness के लिए एकीकृत स्थैतिक-छवि निर्माण रूटिंग। | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | DeepSeek Harness के लिए रीड-ओनली प्रदर्शन डायग्नोस्टिक्स। | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | चीनी सार्वजनिक म्यूचुअल फंड के लिए नियतात्मक अनुसंधान रिपोर्ट | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | DSH के लिए GitHub PR/issues एकीकरण, हर लेखन अनुमोदन-द्वारित | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | उद्योग-अनुसंधान ऑर्केस्ट्रेशन जो इस प्लगिन के `ctx.researchReport.assemble` से डिलीवरेबल सील करता है | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | DeepSeek Harness के लिए स्थानीय दस्तावेज़ ज्ञानकोश। | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | DeepSeek Harness के लिए स्थानीय-मॉडल (Ollama) एकीकरण। | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | भाषा सर्वरों पर LSP निदान, फ़ॉर्मेटिंग, पूर्णता, कोड क्रियाएँ और नाम बदलना | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | PII मास्किंग मिडलवेयर: मॉडल सीमा पर अनाम करें, डिस्प्ले लेयर पर पुनर्स्थापित करें | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | केवल-पढ़ने वाला MCP रनटाइम पैनल: /mcp कमांड + स्थिति, टूल और त्रुटियों वाला Settings टैब | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | अनुमोदन-द्वारित क्रॉस-सत्र मेमोरी: ctx.memory सीम + SQLite + मेमोरी टूल | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | DeepSeek Harness के लिए OpenTelemetry और Langfuse अवलोकनीयता निर्यातक। | |
| **[dsh-dsh-output-styles](https://github.com/PerryLink/dsh-dsh-output-styles)** | Claude Code outputStyles-समतुल्य रनटाइम शैली बदलाव | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | ऑडिट के साथ Claude Code-शैली घोषणात्मक allow/deny/ask अनुमति नियम | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | माँग पर एजेंट कौशल के रूप में प्लगइन-विकास ज्ञान आधार | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | सामग्री-पता साक्ष्य और सीलबंद संस्करणों वाला सत्यापन-योग्य अनुसंधान-रिपोर्ट इंजन | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | DeepSeek Harness प्लगिनों की बहु-आयामी गुणवत्ता स्कोरिंग। | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | टिकाऊ क्रम के साथ वेब साइडबार में सत्र पिन करें | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | DeepSeek Harness के लिए क्रॉस-डिवाइस सत्र सिंक — आपके सत्र स्टोर का एक समर्पित git मिरर। | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | DeepSeek Harness के लिए आवाज़-प्रथम सत्र लूप: बोलें और उत्तर सुनें। | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | DeepSeek Harness प्लगिनों के लिए पृथक इंस्टॉल-एंड-स्मोक टेस्ट ड्राइव। | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | DeepSeek Harness के लिए वेंडर पैरामीटर अनुवाद और नियतात्मक JSON मरम्मत। | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-skill-pack-security contributors
