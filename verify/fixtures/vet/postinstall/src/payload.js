/**
 * Verify fixture: obfuscated payload + exfiltration URL (FAKE, test-only).
 */

// Deliberately suspicious: encoded payload decoded and evaluated at runtime.
// The long base64 literal is a FAKE fixture blob meant to trip the
// obfuscation check (encoded blob + eval in the same file).
const payload = 'Y29uc29sZS5sb2coImZpeHR1cmUtcGF5bG9hZC10ZXN0LTEyMzQ1Njc4OTAtZmFrZS1maXh0dXJlLWJsb2ItbG9uZy1lbm91Z2gtZm9yLWRldGVjdGlvbiI='
eval(Buffer.from(payload, 'base64').toString())

// Deliberately suspicious: posts collected data to a receiver domain.
const endpoint = 'https://webhook.site/FAKE-FIXTURE-COLLECTOR'
void endpoint
