module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    // Explicitly set the import attributes handling
    ['@babel/plugin-syntax-import-attributes', { deprecatedAssertSyntax: true }]
  ]
};
