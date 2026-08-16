/**
 * Verify fixture: a plugin target whose postinstall downloads and executes,
 * whose code carries an exfiltration URL and an encoded eval payload.
 * `plugin_vet` must flag install-scripts, network-exfil and obfuscation.
 * @module dsh-fixture-postinstall
 */

export const name = 'fixture-postinstall'
