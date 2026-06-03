/**
 * Constant-time string comparison for shared secrets (webhook / internal
 * notification secrets), to avoid remote timing-oracle attacks that a plain
 * `a !== b` short-circuit comparison would expose.
 *
 * Implemented in pure JS so it works in BOTH the Edge and Node.js runtimes —
 * Node's `crypto.timingSafeEqual` is unavailable on the Edge runtime used by
 * several of our notify routes. The full loop always runs (no early exit).
 * Length is compared first; for fixed-length secrets the length is not itself
 * sensitive.
 */
export function timingSafeEqualStr(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false

  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
