/**
 * Verify fixture: benign plugin entry. No install scripts, no network calls.
 * @module dsh-fixture-clean
 */

export const name = 'fixture-clean'
export const inject: string[] = []

export function apply(): void {
  // Nothing here: this repository exists only as a plugin_vet test target.
}
