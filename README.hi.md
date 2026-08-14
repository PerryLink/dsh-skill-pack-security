<h1 align="center">dsh-skill-pack-security</h1>

<p align="center">
  <b>DeepSeek Harness के लिए सुरक्षा-ऑडिट पद्धति — पाँच एजेंट स्किल, शून्य रनटाइम कोड।</b><br/>
  सीक्रेट स्कैनिंग · डिपेंडेंसी ऑडिट · सप्लाई-चेन समीक्षा · प्रॉम्प्ट-इंजेक्शन समीक्षा · ऑडिट आयोजन
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
  <img src="https://img.shields.io/badge/skills-5-8257D0" alt="5 स्किल">
  <img src="https://img.shields.io/badge/verified-19%2F19%20checks-brightgreen" alt="सत्यापित: 19/19 जाँच">
  <img src="https://img.shields.io/badge/languages-EN%2FZH%2FES%2FPT%2FHI-4D6BFE" alt="भाषाएँ: EN/ZH/ES/PT/HI">
</p>

---

## यह क्या है?

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — जो [Cordis](https://github.com/cordiverse/cordis) पर बना "हर चीज़ एक प्लगइन है" वाला एजेंट हार्नेस है — के लिए एक **शुद्ध स्किल पैक**। यह पाँच सुरक्षा-ऑडिट पद्धतियों को `SKILL.md` बंडल के रूप में वितरित करता है: मॉडल उन्हें सत्र कैटलॉग में खोजता है और `skill` टूल से ज़रूरत पर पूरा पाठ लोड करता है।

> रिपॉज़िटरी: https://github.com/PerryLink/dsh-skill-pack-security

**शून्य रनटाइम कोड।** कोई टूल पंजीकृत नहीं, कोई सेवा पंजीकृत नहीं, सत्र व्यवहार में कोई बदलाव नहीं। एकमात्र निष्पादन-योग्य वैकल्पिक `provider/` प्लगइन है — पैकेजिंग का एक प्रदर्शन — और पैक उसके बिना भी ठीक वैसे ही काम करता है।

हर स्किल **मॉडल द्वारा निष्पादन-योग्य** है: हर चरण एक वास्तविक कमांड है (`gitleaks`, `trivy`, `pnpm audit`, `npm view`, `git …`) जिसमें अपेक्षित आउटपुट का नमूना, एग्ज़िट-कोड कसौटी और गलत-सकारात्मक (false positive) कसौटियाँ दी गई हैं। कोई अप्रमाणित दावा नहीं।

## टूल क्यों नहीं, स्किल क्यों?

| रूप | क्या करता है | क्या नहीं कर सकता |
|---|---|---|
| टूल प्लगइन (जैसे स्कैनर) | स्कैन **निष्पादित** करता है, निष्कर्ष लौटाता है | अलर्ट की व्याख्या, गलत-सकारात्मक का वर्गीकरण, रिडैक्टेड रिपोर्ट लिखना |
| प्रोटोकॉल परत | किसी प्रोटोकॉल को **बाधित** करता है | रेपो और एजेंटों के बीच सामान्यीकरण |
| **स्किल पैक (यह रेपो)** | **पद्धति सिखाता है**: ट्राइएज, रिपोर्ट, समाधान-क्रम | स्वयं स्कैन चलाना |

टूल-प्रकार के सुरक्षा प्लगइन के साथ स्थापित करने पर दोनों मिलकर काम करते हैं: टूल स्कैन चलाता है, स्किल व्याख्या, ट्राइएज और रिपोर्ट को दिशा देती है — मॉडल इस पैक की पद्धति का पालन करते हुए प्लगइन के टूल बुलाता है।

Claude Code इकोसिस्टम की 3000+ स्किल इस रूप के वितरण-मूल्य को सिद्ध करती हैं। DSH का `SKILL.md` फ्रंटमैटर (`name`, `description`, `whenToUse`) CC स्किल प्रारूप के अनुकूल है; यह पैक केवल साझा उपसमुच्चय का उपयोग करता है और इसकी सामग्री पूर्णतः मौलिक है।

## पाँच स्किल

| स्किल | एक-पंक्ति उद्देश्य | कब उपयोग करें |
|---|---|---|
| `security-audit` | पाँच-चरणीय ऑडिट प्रवाह: दायरा → सूची → जोखिम-वर्गीकरण → सत्यापन → रिपोर्ट टेम्पलेट | पूरे रेपो का ऑडिट, रिपोर्ट, योजना |
| `secret-scan` | क्रेडेंशियल ऑडिट: gitleaks/trivy उपयोग, गलत-सकारात्मक स्तर, रिडैक्टेड रिपोर्ट, समाधान-क्रम | सीक्रेट स्कैनिंग, अलर्ट ट्राइएज, लीक रिपोर्ट |
| `dependency-audit` | सप्लाई-चेन ऑडिट: pnpm/npm audit पठन, लाइसेंस, टाइपोस्क्वैट जोखिम, लॉकफ़ाइल विचलन | डिपेंडेंसी समीक्षा, ऑडिट-रिपोर्ट व्याख्या |
| `supply-chain-review` | PR/नई डिपेंडेंसी की त्वरित समीक्षा: खतरनाक इंस्टॉल स्क्रिप्ट, टाइपोस्क्वैट, पुनरुत्पादनीय बिल्ड | नई डिपेंडेंसी जोड़ने वाले PR की समीक्षा |
| `prompt-injection-review` | एजेंट परियोजनाओं की इंजेक्शन-सतह समीक्षा: AGENTS.md, स्किल, टूल विवरण, MCP, वेब | मॉडल-संदर्भ की इंजेक्शन सतहों की समीक्षा |

हर बंडल: मुख्य फ़ाइल ≤ 300 पंक्तियाँ (क्रमिक खुलासा; विवरण `references/` में), `description` में "कब उपयोग करें / कब नहीं" स्वतः-निहित, और सटीक ट्रिगर वाला `whenToUse`।

## शीघ्र आरंभ

DSH का स्थानीय स्किल प्रदाता चार रूट को रैंक क्रम में स्कैन करता है — एक परत में समान-नाम टकराव में छोटा रैंक जीतता है:

| रैंक | रूट | दायरा |
|---|---|---|
| 100 | `<प्रोजेक्टरूट>/.dsh/skills` | प्रोजेक्ट-स्तरीय, रेपो के साथ चलता है |
| 200 | `<प्रोजेक्टरूट>/.agents/skills` | प्रोजेक्ट-स्तरीय, साझा एजेंट निर्देशिका |
| 400 | `<dshHome>/skills` (`$DSH_HOME` या `~/.dsh`) | उपयोगकर्ता-स्तरीय, केवल DSH |
| 500 | `<agentsHome>/skills` (`$DSH_AGENTS_HOME` या `~/.agents`) | उपयोगकर्ता-स्तरीय, एजेंटों के बीच |

एक-कमांड स्थापना (PowerShell):

```powershell
./scripts/install.ps1 -Target user-agents   # या: project-dsh | project-agents | user-dsh
```

या मैन्युअल कॉपी (Windows PowerShell उदाहरण; कोई भी शेल चलेगा):

```powershell
Copy-Item -Recurse .\skills\* "$HOME\.agents\skills\"
```

कैटलॉग अगले DSH सत्र में दिखेगा। स्किल के मुख्य भाग हॉट-रीलोड होते हैं — `SKILL.md` बदलें और अगला `skill` लोड नया पाठ पढ़ता है; रीस्टार्ट की आवश्यकता नहीं। अनइंस्टॉल = कॉपी की गई निर्देशिकाएँ हटाएँ।

वैकल्पिक: बिना कॉपी किए पूरा पैक `provider/` प्लगइन से माउंट करें (देखें [provider/README.md](provider/README.md))।

## अंदर क्या है

| पथ | क्या है |
|---|---|
| `skills/<नाम>/SKILL.md` | पाँच स्किल; फ्रंटमैटर आधिकारिक `dsh-skill-filesystem` अनुबंध का पालन करता है |
| `skills/<नाम>/references/` | क्रमिक-खुलासा विवरण: कमांड मैट्रिक्स, ट्राइएज तालिकाएँ, टेम्पलेट |
| `scripts/install.ps1` | चारों रूट के लिए एक-कमांड इंस्टॉलर |
| `provider/` | वैकल्पिक प्रदाता प्लगइन (पैकेजिंग प्रदर्शन, `ctx.effect()` से पंजीकृत) |
| `verify/verify-skill-pack.mts` | आधिकारिक पार्सर और वास्तविक `skill` टूल के विरुद्ध हेडलेस सत्यापन |
| `docs/ecosystem-conflict-check.md` | `dsh-plugin` इकोसिस्टम के GitHub टॉपिक/नाम संघर्षों का स्नैपशॉट |
| `.github/workflows/verify.yml` | CI: हर push पर हार्नेस स्थापित कर 9 जाँचें चलाता है |
| `LICENSE` | Apache License 2.0 |

## सत्यापन

`verify/verify-skill-pack.mts` स्थानीय `deepseek-harness` चेकआउट से **आधिकारिक** `dsh-skill-filesystem` पार्सर और **वास्तविक** `skill` टूल आयात करके 9 जाँच-समूह सत्यापित करता है:

1. संरचना: 5 निर्देशिका बंडल, कोई बिखरी हुई फ्लैट md नहीं, फ्रंटमैटर `name` निर्देशिका से मेल खाता है, ≤ 300 पंक्तियाँ, `references/` जुड़ा हुआ
2. आधिकारिक 12 `.agents/skills/` स्किलों या ज्ञात सामुदायिक स्किल पैकों से कोई नाम-टकराव नहीं
3. आधिकारिक प्रदाता से सभी 5 स्किल खोजी गईं
4. `ctx.skills.get()` हर मुख्य भाग, मेटाडेटा और आह्वान नीति लोड करता है
5. वास्तविक `skill` टूल सभी 5 स्किलों के लिए `<skill_content>` लौटाता है; अज्ञात/अमान्य नाम अस्वीकृत
6. सत्र कैटलॉग में केवल `name` + `description` — `whenToUse` मॉडल कैटलॉग से बाहर रहता है (आधिकारिक डिज़ाइन)
7. 13 खराब-फ्रंटमैटर नमूने आधिकारिक फेल-क्लोज़्ड नियमों की जाँच करते हैं (अनुपस्थित फ़ील्ड, विरासती कैमल-केस कुंजियाँ, गैर-बूलियन मान, गैर-केबैब नाम, नेस्टेड निर्देशिकाएँ, नाम-बेमेल)
8. फ्लैट-फ़ाइल स्किल लोड होती हैं; नेस्टेड `**/SKILL.md` नहीं खोजा जाता
9. वैकल्पिक प्रदाता प्लगइन `ctx.effect()` से माउंट होता है और साफ़-सफ़ाई से हटता है

```powershell
# स्थानीय: पैक के बगल वाले हार्नेस चेकआउट को स्वतः हल करता है, या स्पष्ट रूप से बताएँ
$env:DSH_HARNESS_CHECKOUT = 'D:\deepseek-harness'
& D:\deepseek-harness\node_modules\.bin\tsx.CMD verify\verify-skill-pack.mts
# All 9 checks passed for dsh-skill-pack-security.
```

यही 9 जाँचें `.github/workflows/verify.yml` के ज़रिए हर push पर GitHub पर भी चलती हैं (ऊपर बैज)।

## रोडमैप

- `dsh-skill-pack-data-engineering` — डेटा पाइपलाइन, डेटा गुणवत्ता, ETL चेकलिस्ट (वही टेम्पलेट)
- `dsh-skill-pack-oss-collab` — PR शिष्टाचार, इश्यू ट्राइएज, मेंटेनर कार्यप्रवाह
- `dsh-skill-pack-performance` — प्रोफ़ाइलिंग पद्धति, बेंचमार्क कसौटियाँ, रिग्रेशन चेकलिस्ट
- वैकल्पिक: पैक को `dsh-skill-badge` की तर्ज़ पर बंडल्ड बैज प्रदाता के रूप में पैकेज करना

## टॉपिक्स

यदि आप इस पैक को GitHub पर होस्ट करते हैं, तो रिपॉज़िटरी टॉपिक सेट करें: **`dsh`**, **`dsh-plugin`** — साथ में `skill-pack`, `security-audit`, `supply-chain-security`, `prompt-injection`। ऊपर के `dsh` / `dsh-plugin` बैज उसी पहचान को दर्शाते हैं, और `provider/package.json` के `keywords` में वही मान हैं।

## सीमाएँ

टूल-प्रकार का सुरक्षा-ऑडिट प्लगइन नहीं (स्कैनर प्लगइनों का जानबूझकर पूरक), कोई स्किल मार्केटप्लेस नहीं, CC स्किल की कोई कॉपी नहीं — प्रारूप-अनुकूल, सामग्री-मौलिक।

## लाइसेंस

[Apache License 2.0](LICENSE) — © 2026 dsh-skill-pack-security contributors। स्किल सामग्री और वैकल्पिक प्रदाता प्लगइन दोनों इसी लाइसेंस के अंतर्गत हैं।
