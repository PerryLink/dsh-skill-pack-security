<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>DeepSeek Harness के लिए सुरक्षा-ऑडिट पद्धति — आठ एजेंट स्किल, शून्य रनटाइम कोड।</b><br/>
  सीक्रेट स्कैनिंग · डिपेंडेंसी ऑडिट · सप्लाई-चेन समीक्षा · प्रॉम्प्ट-इंजेक्शन समीक्षा · ऑडिट आयोजन · थ्रेट मॉडलिंग · वल्न इंटेल · इंसिडेंट रिस्पॉन्स
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt.md">Português</a> ·
  <b><a href="README.hi.md">हिन्दी</a></b>
</p>

<p align="center">
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/stargazers"><img src="https://img.shields.io/github/stars/PerryLink/dsh-skill-pack-security?style=flat-square&color=yellow" alt="Stars"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/network/members"><img src="https://img.shields.io/github/forks/PerryLink/dsh-skill-pack-security?style=flat-square&color=blue" alt="Forks"></a>
  <a href="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml"><img src="https://github.com/PerryLink/dsh-skill-pack-security/actions/workflows/verify.yml/badge.svg" alt="Verify"></a>
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="लाइसेंस: Apache-2.0">
  <img src="https://img.shields.io/badge/topic-dsh-4D6BFE" alt="टॉपिक: dsh">
  <img src="https://img.shields.io/badge/topic-dsh--plugin-4D6BFE" alt="टॉपिक: dsh-plugin">
  <img src="https://img.shields.io/badge/skills-8-8257D0" alt="8 स्किल">
  <img src="https://img.shields.io/badge/verified-19%2F19%20checks-brightgreen" alt="सत्यापित: 19/19 जाँच">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="भाषाएँ: EN/ZH/ES/PT/HI">
</p>

---

## यह क्या है?

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — जो [Cordis](https://github.com/cordiverse/cordis) पर बना "हर चीज़ एक प्लगइन है" वाला एजेंट हार्नेस है — के लिए एक **शुद्ध स्किल पैक**। यह आठ सुरक्षा पद्धतियों को `SKILL.md` बंडल के रूप में वितरित करता है: मॉडल उन्हें सत्र कैटलॉग में खोजता है और `skill` टूल से ज़रूरत पर पूरा पाठ लोड करता है।

> रिपॉज़िटरी: https://github.com/PerryLink/dsh-skill-pack-security

**शून्य रनटाइम कोड।** कोई टूल पंजीकृत नहीं, कोई सेवा पंजीकृत नहीं, सत्र व्यवहार में कोई बदलाव नहीं। एकमात्र निष्पादन-योग्य वैकल्पिक `provider/` प्लगइन है — पैकेजिंग का एक प्रदर्शन — और पैक उसके बिना भी ठीक वैसे ही काम करता है।

हर स्किल **मॉडल द्वारा निष्पादन-योग्य** है: हर चरण एक वास्तविक कमांड है (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) जिसमें अपेक्षित आउटपुट का नमूना, एग्ज़िट-कोड कसौटी और गलत-सकारात्मक (false positive) कसौतियाँ दी गई हैं। कोई अप्रमाणित दावा नहीं।

## टूल क्यों नहीं, स्किल क्यों?

| रूप | क्या करता है | क्या नहीं कर सकता |
|---|---|---|
| टूल प्लगइन (जैसे स्कैनर) | स्कैन **निष्पादित** करता है, निष्कर्ष लौटाता है | अलर्ट की व्याख्या, गलत-सकारात्मक का वर्गीकरण, रिडैक्टेड रिपोर्ट लिखना |
| प्रोटोकॉल परत | किसी प्रोटोकॉल को **बाधित** करता है | रेपो और एजेंटों के बीच सामान्यीकरण |
| **स्किल पैक (यह रेपो)** | **पद्धति सिखाता है**: ट्राइएज, रिपोर्ट, समाधान-क्रम | स्वयं स्कैन चलाना |

टूल-प्रकार के सुरक्षा प्लगइन के साथ स्थापित करने पर दोनों मिलकर काम करते हैं: टूल स्कैन चलाता है, स्किल व्याख्या, ट्राइएज और रिपोर्ट को दिशा देती है — मॉडल इस पैक की पद्धति का पालन करते हुए प्लगइन के टूल बुलाता है।

Claude Code इकोसिस्टम की 3000+ स्किल इस रूप के वितरण-मूल्य को सिद्ध करती हैं। DSH का `SKILL.md` फ्रंटमैटर (`name`, `description`, `whenToUse`) CC स्किल प्रारूप के अनुकूल है; यह पैक केवल साझा उपसमुच्चय का उपयोग करता है और इसकी सामग्री पूर्णतः मौलिक है।

## आठ स्किल

| स्किल | एक-पंक्ति उद्देश्य | कब उपयोग करें |
|---|---|---|
| `security-audit` | पाँच-चरणीय ऑडिट प्रवाह: दायरा → सूची → जोखिम-वर्गीकरण → सत्यापन → रिपोर्ट टेम्पलेट | पूरे रेपो का ऑडिट, रिपोर्ट, योजना |
| `secret-scan` | क्रेडेंशियल ऑडिट: gitleaks/trivy उपयोग, गलत-सकारात्मक स्तर, रिडैक्टेड रिपोर्ट, समाधान-क्रम | सीक्रेट स्कैनिंग, अलर्ट ट्राइएज, लीक रिपोर्ट |
| `dependency-audit` | सप्लाई-चेन ऑडिट: pnpm/npm audit पठन, लाइसेंस, टाइपोस्क्वैट जोखिम, लॉकफ़ाइल विचलन | डिपेंडेंसी समीक्षा, ऑडिट-रिपोर्ट व्याख्या |
| `supply-chain-review` | PR/नई डिपेंडेंसी की त्वरित समीक्षा: खतरनाक इंस्टॉल स्क्रिप्ट, टाइपोस्क्वैट, पुनरुत्पादनीय बिल्ड | नई डिपेंडेंसी जोड़ने वाले PR की समीक्षा |
| `prompt-injection-review` | एजेंट परियोजनाओं की इंजेक्शन-सतह समीक्षा: AGENTS.md, स्किल, टूल विवरण, MCP, वेब | मॉडल-संदर्भ की इंजेक्शन सतहों की समीक्षा |
| `threat-model` | डिज़ाइन-चरण थ्रेट मॉडलिंग: विश्वास सीमाएँ, STRIDE तालिका, आक्रमण वृक्ष, न्यूनीकरण | नई सुविधाओं की मॉडलिंग, डिज़ाइन-चरण सुरक्षा समीक्षा |
| `vuln-intel` | भेद्यता इंटेलिजेंस: NVD/CISA-KEV/GHSA/OSV लुकअप, निर्णय कसौतियों के साथ | CVE/GHSA id दिए जाने पर प्रभाव और दोहन की जाँच |
| `incident-response` | एजेंट-परिवेश इंसिडेंट रिस्पॉन्स: रोकें → साक्ष्य → पुनर्प्राप्ति → पोस्टमार्टम | DSH/एजेंट सेटअप में संदिग्ध सुरक्षा घटनाएँ |

हर बंडल: मुख्य फ़ाइल ≤ 300 पंक्तियाँ (क्रमिक खुलासा; विवरण `references/` में), `description` में "कब उपयोग करें / कब नहीं" स्वतः-निहित, और सटीक ट्रिगर वाला `whenToUse`।

**दो भाषा संस्करण।** हर स्किल दो संस्करणों में समान नाम और मेटाडेटा के साथ वितरित होती है: `skills/` (चीनी) और `skills-en/` (अंग्रेज़ी)। प्रति रूट एक भाषा स्थापित करें — एक रूट में समान-नाम स्किल रैंक से हल होती हैं, इसलिए सत्र कैटलॉग में केवल एक संस्करण प्रवेश करता है। भाषा-संस्करण नियमों के लिए [docs/release-checklist.md](docs/release-checklist.md) देखें।

## शीघ्र आरंभ

DSH का स्थानीय स्किल प्रदाता चार रूट को रैंक क्रम में स्कैन करता है — एक परत में समान-नाम टकराव में छोटा रैंक जीतता है:

| रैंक | रूट | दायरा |
|---|---|---|
| 100 | `<प्रोजेक्टरूट>/.dsh/skills` | प्रोजेक्ट-स्तरीय, रेपो के साथ चलता है |
| 200 | `<प्रोजेक्टरूट>/.agents/skills` | प्रोजेक्ट-स्तरीय, साझा एजेंट निर्देशिका |
| 400 | `<dshHome>/skills` (`$DSH_HOME` या `~/.dsh`) | उपयोगकर्ता-स्तरीय, केवल DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` या `~/.agents`) | उपयोगकर्ता-स्तरीय, एजेंटों के बीच |

रैंक (एक परत में समान-नाम टकराव में छोटा रैंक जीतता है): `project-dsh 100 < project-agents 200 < custom 300 < user-dsh 400 < user-agents 500`। कस्टम रैंक 300 प्लगइन-पंजीकृत है (जैसे इस पैक का वैकल्पिक `provider/`), डिस्क रूट नहीं।

एक-कमांड स्थापना (PowerShell, Windows):

```powershell
./scripts/install.ps1 -Target user-agents -Language zh   # Target: project-dsh | project-agents | user-dsh | user-agents; Language: zh (डिफ़ॉल्ट) | en
```

या bash (macOS/Linux/CI):

```sh
bash ./scripts/install.sh --target user-agents --language en
```

या हाथ से कॉपी करें (Windows PowerShell उदाहरण; कोई भी शेल चलेगा — अंग्रेज़ी संस्करण के लिए `skills-en\` उपयोग करें):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

कैटलॉग अगले DSH सत्र में दिखेगा। स्किल के मुख्य भाग हॉट-रीलोड होते हैं — `SKILL.md` बदलें और अगला `skill` लोड नया पाठ पढ़ता है; रीस्टार्ट की आवश्यकता नहीं। अनइंस्टॉल = इंस्टॉलर को `-Uninstall` / `--uninstall` के साथ चलाएँ (यह ठीक वही हटाता है जो उसके मैनिफ़ेस्ट ने दर्ज किया) या कॉपी की गई निर्देशिकाएँ हाथ से हटाएँ।

वैकल्पिक: बिना कॉपी किए पूरा पैक `provider/` प्लगइन से माउंट करें — `language: zh|en` संस्करण चुनता है (देखें [provider/README.md](provider/README.md))। प्रदाता npm पर [`@perrylink/dsh-skill-pack-security-provider`](https://www.npmjs.com/package/@perrylink/dsh-skill-pack-security-provider) के रूप में प्रकाशित है: `dsh plugin add @perrylink/dsh-skill-pack-security-provider` एक ही कमांड से उसे माउंट करता है।

## अंदर क्या है

| पथ | क्या है |
|---|---|
| `skills/<नाम>/SKILL.md` | आठ स्किल (चीनी संस्करण); फ्रंटमैटर आधिकारिक `dsh-skill-filesystem` अनुबंध का पालन करता है |
| `skills-en/<नाम>/SKILL.md` | आठ स्किल (अंग्रेज़ी संस्करण); चीनी संस्करण के समान नाम और मेटाडेटा |
| `skills/<नाम>/references/` | क्रमिक-खुलासा विवरण: कमांड मैट्रिक्स, ट्राइएज तालिकाएँ, टेम्पलेट |
| `scripts/install.ps1` | चारों रूट के लिए एक-कमांड Windows इंस्टॉलर (दोनों भाषा संस्करण); मैनिफ़ेस्ट दर्ज करता है, `-Uninstall`/`-DryRun`/`-Force` समर्थित |
| `scripts/install.sh` | POSIX समकक्ष (`--uninstall`/`--dry-run`/`--force`) |
| `provider/` | वैकल्पिक npm-इंस्टॉल-योग्य प्रदाता बंडल (`dsh.bundle` घोषित करता है; `prepack` से दोनों संस्करण `pack/` में एम्बेड करता है; `language: zh\|en`); `ctx.effect()` से पंजीकृत, गलत `skillsDir` पर ज़ोर से विफल |
| `verify/verify-skill-pack.mts` | आधिकारिक पार्सर और वास्तविक `skill` टूल के विरुद्ध हेडलेस सत्यापन — दोनों संस्करणों में 19 जाँचें |
| `VERSION` | एकल संस्करण स्रोत; हर SKILL.md `metadata.version` और `provider/package.json` को उससे मेल खाना चाहिए (CI-प्रवर्तित) |
| `docs/ecosystem-conflict-check.md` | `dsh-plugin` इकोसिस्टम के GitHub टॉपिक/नाम संघर्षों का स्नैपशॉट |
| `docs/release-checklist.md` | रिलीज़ प्रवाह: संस्करण-समन्वय बिंदु, भाषा-संस्करण नियम, टैगिंग |
| `docs/improvement-plan.md` | 1.2.0 सुधार योजना, प्रति-आइटम साक्ष्य और स्वीकृति कसौतियों के साथ |
| `CHANGELOG.md` / `SECURITY.md` / `CONTRIBUTING.md` | रिलीज़ इतिहास, भेद्यता रिपोर्टिंग नीति और योगदान/सत्यापन नियम |
| `.github/workflows/verify.yml` | CI: 19-जाँच सत्यापन + install.sh/install.ps1 अभ्यास + प्रदाता build/pack स्मोक, Ubuntu और Windows पर, पिन किए गए हार्नेस कमिट के विरुद्ध |
| `.github/dependabot.yml` | प्रदाता और GitHub Actions के लिए साप्ताहिक डिपेंडेंसी अपडेट |
| `LICENSE` | Apache License 2.0 |

## सत्यापन

`verify/verify-skill-pack.mts` स्थानीय `deepseek-harness` चेकआउट से **आधिकारिक** `dsh-skill-filesystem` पार्सर और **वास्तविक** `skill` टूल आयात करके दोनों भाषा संस्करणों पर 19 जाँचें सत्यापित करता है:

1. संरचना: दोनों संस्करण मौजूद, प्रत्येक में 8 निर्देशिका बंडल, कोई बिखरी हुई फ्लैट स्किल नहीं, फ्रंटमैटर `name` निर्देशिका से मेल खाता है, ≤ 300 पंक्तियाँ, `references/` जुड़ा हुआ, `metadata.version` `VERSION` फ़ाइल से समन्वित
2. आधिकारिक `.agents/skills/` स्किलों (रन टाइम पर चेकआउट से प्राप्त) या ज्ञात सामुदायिक स्किल पैकों से कोई नाम-टकराव नहीं
3–6. प्रति संस्करण (चीनी `skills/`, अंग्रेज़ी `skills-en/`): आधिकारिक प्रदाता से रजिस्ट्री खोज, पूर्ण `ctx.skills.get()` लोड, वास्तविक `skill` टूल द्वारा `<skill_content>` लौटाना (अज्ञात/अमान्य नाम अस्वीकृत), और सत्र कैटलॉग में केवल `name` + `description` — `whenToUse` मॉडल कैटलॉग से बाहर रहता है (आधिकारिक डिज़ाइन)
7. 13 खराब-फ्रंटमैटर नमूने आधिकारिक फेल-क्लोज़्ड नियमों की जाँच करते हैं (अनुपस्थित फ़ील्ड, विरासती कैमल-केस कुंजियाँ, गैर-बूलियन मान, गैर-केबैब नाम, नेस्टेड निर्देशिकाएँ, नाम-बेमेल); फ्लैट-फ़ाइल स्किल लोड होती हैं और नेस्टेड `**/SKILL.md` नहीं खोजा जाता
8. वैकल्पिक प्रदाता प्लगइन `ctx.effect()` से चीनी और अंग्रेज़ी संस्करण माउंट करता है, साफ़-सफ़ाई से हटता है, और गलत विन्यास (खाली या अस्तित्वहीन `skillsDir`) अस्वीकार करता है
9–15. स्व-सुदृढ़ीकरण जाँचें: zh↔en संरचनात्मक समानता, references वायरिंग (कोई लटकी/अनाथ फ़ाइल नहीं), प्रदाता संस्करण समन्वय, प्रलेखित स्किल-रूट रैंक बनाम आधिकारिक स्थिरांक, POSIX-पोर्टेबल `grep -E` पैटर्न, सीक्रेट स्व-जाँच, UTF-8-सुरक्षित रिलीज़ चेकलिस्ट

```powershell
# स्थानीय: पैक के बगल वाले हार्नेस चेकआउट को स्वतः हल करता है, या स्पष्ट रूप से बताएँ
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 19 checks passed for dsh-skill-pack-security.
```

यही 19 जाँचें `.github/workflows/verify.yml` के ज़रिए हर push पर GitHub पर चलती हैं (ऊपर बैज) — Ubuntu और Windows पर — साथ ही `install.sh`/`install.ps1` अभ्यास और एक स्वतंत्र प्रदाता build/pack स्मोक जो सत्यापित करता है कि टारबॉल में दोनों एम्बेडेड संस्करण और बंडल पैच (`provider` जॉब) हैं। पुनरुत्पादनीय सत्यापन के लिए हार्नेस चेकआउट एक कमिट पर पिन है।

## रोडमैप

- `dsh-skill-pack-data-engineering` — डेटा पाइपलाइन, डेटा गुणवत्ता, ETL चेकलिस्ट (वही टेम्पलेट)
- `dsh-skill-pack-oss-collab` — PR शिष्टाचार, इश्यू ट्राइएज, मेंटेनर कार्यप्रवाह
- `dsh-skill-pack-performance` — प्रोफ़ाइलिंग पद्धति, बेंचमार्क कसौतियाँ, रिग्रेशन चेकलिस्ट
- इस पैक में और स्किलें (वही शुद्ध-स्किल सीमा): `sbom-lifecycle` (SBOM निर्माण/पुरानापन/आयात कार्यप्रवाह), `pen-test-review` (अधिकृत-सहभागिता का दायरा निर्धारण और रिपोर्ट समीक्षा; भेजने से पहले नाम टकराव के लिए इकोसिस्टम स्नैपशॉट दोबारा जाँचें), `compliance-audit` (ASVS/NIST-CSF वॉकथ्रू)
- प्रदाता बंडल npm पर `@perrylink/dsh-skill-pack-security-provider` के रूप में प्रकाशित (`dsh plugin add` के लिए तैयार); हर रिलीज़ के साथ `docs/release-checklist.md` के ज़रिए समन्वित रखें

## टॉपिक्स

यदि आप इस पैक को GitHub पर होस्ट करते हैं, तो रिपॉज़िटरी टॉपिक सेट करें: **`dsh`**, **`dsh-plugin`** — साथ में `skill-pack`, `security-audit`, `supply-chain-security`, `prompt-injection`। ऊपर के `dsh` / `dsh-plugin` बैज उसी पहचान को दर्शाते हैं, और `provider/package.json` के `keywords` में वही मान हैं।

## सीमाएँ

टूल-प्रकार का सुरक्षा-ऑडिट प्लगइन नहीं (स्कैनर प्लगइनों का जानबूझकर पूरक), कोई स्किल मार्केटप्लेस नहीं, CC स्किल की कोई कॉपी नहीं — प्रारूप-अनुकूल, सामग्री-मौलिक।

## लाइसेंस

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors। स्किल सामग्री और वैकल्पिक प्रदाता प्लगइन दोनों इसी लाइसेंस के अंतर्गत हैं।
