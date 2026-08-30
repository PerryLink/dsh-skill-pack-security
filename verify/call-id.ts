/**
 * Dual-ruler call-id brand for the verify script (mirrors
 * dsh-click/tests/call-id.ts).
 *
 * The pinned harness ref (b150a551) exports dsh-llm `CallId`, while harness
 * master renamed the brand to `ToolCallId` (packages/llm/llm/src/brand.ts).
 * The dsh-tools execution contract (`ToolExecution['callId']`) carries that
 * brand on both rulers, so derive the brand from the contract instead of
 * naming either brand name: the script stays green on the pinned ref today
 * and on a future pin lift to 0.1.2-alpha.1.
 *
 * The type-only `@deepseek-ai/dsh-tools` import is erased at runtime (this
 * file runs under tsx), so it never needs to resolve; the runtime export is
 * a plain identity cast, exactly like the dsh-llm brand function it replaces.
 * @module dsh-skill-pack-security/verify/call-id
 */

import type { ToolExecution } from '@deepseek-ai/dsh-tools'

export type CallId = ToolExecution['callId']
export const CallId = ((id: string) => id) as unknown as (id: string) => ToolExecution['callId']
