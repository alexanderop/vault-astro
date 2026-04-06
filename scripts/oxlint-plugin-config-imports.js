/**
 * Oxlint JS plugin: no-alias-in-config-files
 *
 * Prevents @/ alias imports in files transitively imported from astro.config.mjs.
 * Astro loads the config before Vite initializes, so the @/ alias doesn't resolve.
 * See: https://github.com/withastro/astro/issues/9782
 *
 * Uses the ESLint-compatible plugin API supported by oxlint's jsPlugins feature.
 */

// Files and directories in the astro.config.mjs transitive import chain.
// Keep in sync with the actual imports in astro.config.mjs.
const CONFIG_TIME_PATTERNS = [
  "src/features/wikilinks/lib/",
  "src/features/callouts/lib/",
  "src/features/highlights/lib/",
  "src/features/tags/lib/",
  "src/features/embeds/lib/",
  "src/features/mermaid/lib/",
  "src/features/dataview/lib/",
  "src/lib/sync-excalidraw-assets.ts",
  "src/lib/content-resolver.ts",
  "src/lib/content-resolver.server.ts",
  "src/lib/content-utils.ts",
  "src/lib/filesystem.ts",
];

function isConfigTimeFile(filename) {
  // Normalize path separators and strip leading ./
  const normalized = filename.replace(/\\/g, "/").replace(/^\.\//, "");

  // Test files are never in the config import chain
  if (/\.(test|spec)\./.test(normalized)) {
    return false;
  }

  return CONFIG_TIME_PATTERNS.some((pattern) => normalized.includes(pattern));
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow @/ alias imports in files loaded at Astro config time",
    },
    messages: {
      noAliasInConfig:
        'Import "{{ source }}" uses the @/ alias, but this file is loaded before Vite starts (via astro.config.mjs). Use a relative import instead.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    // Only enforce in config-time files
    if (!isConfigTimeFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === "string" && source.startsWith("@/")) {
          context.report({
            node: node.source,
            messageId: "noAliasInConfig",
            data: { source },
          });
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: "config-imports",
  },
  rules: {
    "no-alias-in-config-files": rule,
  },
};

export default plugin;
