/**
 * Oxlint JS plugin: no-cross-feature-imports
 *
 * Enforces the architectural rule: "Features MUST NOT import from other features."
 * Cross-feature composition should happen in pages/ and layouts/.
 *
 * Uses the ESLint-compatible plugin API supported by oxlint's jsPlugins feature.
 */

const FEATURES_DIR = "src/features/";

/**
 * Extract the feature name from a file path.
 * Returns null if the file is not inside src/features/.
 */
function getFeatureName(filepath) {
  const normalized = filepath.replace(/\\/g, "/").replace(/^\.\//, "");
  const idx = normalized.indexOf(FEATURES_DIR);
  if (idx === -1) return null;

  const afterFeatures = normalized.slice(idx + FEATURES_DIR.length);
  const slashIdx = afterFeatures.indexOf("/");
  if (slashIdx === -1) return null;

  return afterFeatures.slice(0, slashIdx);
}

/**
 * Extract the feature name from an import source like "@/features/theme/hooks/use-theme".
 * Returns null if the import is not from a feature.
 */
function getImportedFeatureName(source) {
  // Match both @/features/X/... and relative paths that resolve to features
  const aliasMatch = source.match(/^@\/features\/([^/]+)/);
  if (aliasMatch) return aliasMatch[1];

  return null;
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow imports from other feature modules (features must not import from other features)",
    },
    messages: {
      noCrossFeatureImport:
        'Feature "{{ currentFeature }}" must not import from feature "{{ importedFeature }}". Cross-feature composition belongs in pages/ or layouts/.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const currentFeature = getFeatureName(filename);

    // Only enforce inside feature directories, skip test files
    if (!currentFeature) return {};
    if (/\.(test|spec)\./.test(filename)) return {};

    function checkImportSource(node, source) {
      if (typeof source !== "string") return;

      const importedFeature = getImportedFeatureName(source);
      if (!importedFeature) return;
      if (importedFeature === currentFeature) return;

      context.report({
        node,
        messageId: "noCrossFeatureImport",
        data: { currentFeature, importedFeature },
      });
    }

    return {
      ImportDeclaration(node) {
        checkImportSource(node.source, node.source.value);
      },
      // Also catch dynamic imports: import("@/features/other/...")
      ImportExpression(node) {
        if (node.source && node.source.type === "Literal") {
          checkImportSource(node.source, node.source.value);
        }
      },
      // Also catch re-exports: export { x } from "@/features/other/..."
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkImportSource(node.source, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        if (node.source) {
          checkImportSource(node.source, node.source.value);
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: "feature-boundaries",
  },
  rules: {
    "no-cross-feature-imports": rule,
  },
};

export default plugin;
