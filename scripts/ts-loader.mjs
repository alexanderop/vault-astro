/**
 * Custom Node.js module resolution hook that resolves bare imports to .ts files.
 * Used by audit-content.mjs and similar scripts that import from src/lib/*.ts
 * where the imports omit the .ts extension (because Vite handles that at build time).
 *
 * Usage: node --experimental-strip-types --import ./scripts/register-loader.mjs scripts/audit-content.mjs
 */

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" && !specifier.endsWith(".ts")) {
      return nextResolve(specifier + ".ts", context);
    }
    throw error;
  }
}
