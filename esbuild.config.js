import esbuild from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

esbuild
  .build({
    entryPoints: ['engine.js'],
    outfile: 'build/engine.js',
    bundle: true,
    minify: true,
    platform: 'node',
    sourcemap: true,
    target: 'node14',
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1))
