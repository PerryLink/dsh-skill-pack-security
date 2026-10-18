<div align="center">

# dsh-skill-pack-security
- **1024 स्टोर चैनल**: एक बार `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add dsh-skill-pack-security` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

**DeepSeek Harness के लिए आठ सुरक्षा-ऑडिट स्किल और एक स्वचालित प्लगइन सप्लाई-चेन गेट।**

*स्किल ऑडिट पद्धति सिखाती हैं; `plugin_vet` टूल प्री-इंस्टॉल स्कैन निष्पादित करता है — लाइसेंस / SBOM / कमिट पिनिंग / दुर्भावनापूर्ण पैटर्न / पाँच-आयामी जोखिम कार्ड।*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-skill-pack-security)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-skill-pack-security/verify.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-skill-pack-security/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-skill-pack-security?label=version)](https://github.com/PerryLink/dsh-skill-pack-security/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-skill-pack-security-provider)](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-skill-pack-security?metric=downloads&lang=hi)](https://dshfind.com/hi/plugins/PerryLink/dsh-skill-pack-security?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-skill-pack-security
```


</div>

---

## Install & uninstall

- **git चैनल** (नवीनतम `main`): `dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security` — provider bundle माउंट करता है; `prepack` दोनों संस्करण tarball में एम्बेड करता है।
- **npm चैनल** (प्रकाशित संस्करण): `dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider`।
- **tarball चैनल**: `provider/` में `pnpm pack`, फिर `dsh plugin --profile web add ./@perrylink-dsh-skill-pack-security-provider-<version>.tgz`।
- **अनइंस्टॉल**: `dsh plugin --profile web remove @perrylink/dsh-skill-pack-security-provider` (या पंक्ति हटाएँ; शुद्ध-स्किल प्रतियाँ इंस्टॉलर के `-Uninstall` / `--uninstall` से हटती हैं)।

## What is dsh-skill-pack-security?

DeepSeek Harness के लिए आठ सुरक्षा-ऑडिट स्किल और एक स्वचालित प्लगइन सप्लाई-चेन गेट।

स्किल ऑडिट पद्धति सिखाती हैं; `plugin_vet` टूल प्री-इंस्टॉल स्कैन निष्पादित करता है — लाइसेंस / SBOM / कमिट पिनिंग / दुर्भावनापूर्ण पैटर्न / पाँच-आयामी जोखिम कार्ड।

![dsh-skill-pack-security का टर्मिनल डेमो: dsh-skill-pack-security — install the provider, verify all 25 checks](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-hero.png)

![Animated terminal demo of dsh-skill-pack-security](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-demo.gif)

*वही रन, एनिमेटेड।*

## Comparison

![dsh-skill-pack-security का मापा गया तुलना चार्ट](https://raw.githubusercontent.com/PerryLink/dsh-skill-pack-security/main/docs/assets/dsh-skill-pack-security-evidence.png)

38 poison samples (20 malicious, 18 benign) · benchmark/RESULTS.md

## Compatibility

| सतह | स्थिति |
|---|---|
| Harness | DeepSeek Harness **`dsh-v0.2.1-alpha.1`** (GitHub tag, 2026-09-25 को सत्यापित: पूर्ण गेट श्रृंखला + प्रोफ़ाइल इंस्टॉल स्मोक). npm निर्भरता लाइन: `@deepseek-ai/dsh` **0.1.5-rc.2** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0`). सत्र लिफ़ाफ़ा अपना ignorable फ़ील्ड केवल संग्रहीत-लॉग पठन संगतता के लिए रखता है - Session.append अभी भी इसे स्टैम्प नहीं कर सकता, इसलिए गेट व्यवहार अपरिवर्तित है। |
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

**इंस्टॉल गेट।** निर्णय इंस्टॉलेशन गेट में जाता है — `gate.policy: warn` (डिफ़ॉल्ट, गैर-अवरोधक) FAIL पर चेतावनी छापता है; `gate.policy: deny` अस्वीकृति निर्णय देता है; टूल `dsh plugin add` को इंटरसेप्ट नहीं करता, इंस्टॉलर/CI इसे लागू करता है:

```yaml
- id: skill-pack-security
  name: '@perrylink/dsh-skill-pack-security-provider'
  config:
    language: en
    vet:
      gate:
        policy: deny   # अस्वीकृति निर्णय; कॉलर लागू करता है
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
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security
```

```sh
# 1. bundle को अपने profile में इंस्टॉल करें
dsh plugin --profile web add github:PerryLink/dsh-skill-pack-security

# या npm से (प्रकाशित संस्करण)
dsh plugin --profile web add @perrylink/dsh-skill-pack-security-provider

# 2. रीस्टार्ट करें और पंक्ति की पुष्टि करें
dsh --profile web --dump-config | grep -A3 'id: skill-pack-security'
```

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
| `vet.userAgent` | `dsh-skill-pack-security/2.2.24 (+https://github.com/PerryLink/dsh-skill-pack-security)` | डाउनलोड user-agent |
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

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के **87 सक्रिय रूप से अनुरक्षित** DeepSeek Harness प्लगइन में से एक है। पूरा परिवार **95** प्लगइन है — **5 फ़्रोज़न**, **3 सेवानिवृत्त** — और नीचे संक्षिप्त रखा गया है ताकि हर README की पहली स्क्रीन छोटी रहे। हर पंक्ति देखने के लिए इसे खोलें; कारण स्थिति कॉलम में है।

<details>
<summary>सभी 95 प्लगइन खोलें</summary>

| प्लगइन | एक पंक्ति | स्थिति |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
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

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।
