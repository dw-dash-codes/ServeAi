const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports resolution so Metro uses the CommonJS "main" field
// instead of the "exports" map. This prevents zustand (and similar dual-published
// packages) from resolving to their ESM builds which contain import.meta syntax
// that Hermes / Metro's web bundler cannot handle.
config.resolver.unstable_enablePackageExports = false;

// Add support for .mjs and .cjs extensions as a safety net
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;
