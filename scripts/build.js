#!/usr/bin/env node
const { spawnSync } = require('child_process')
const { build } = require('estrella')

function compileProtocolBuffer() {
  console.log('Generating .proto services...')
  // Protocol Buffer TS generation files
  const protocNpmArgs = [
    'run',
    'protoc',
    '--',
    '--plugin=./node_modules/.bin/protoc-gen-ts_proto',
    '--ts_proto_opt=esModuleInterop=true,returnObservable=false,outputServices=generic-definitions,fileSuffix=.gen,oneof=unions',
    '--ts_proto_out=src/views/inspector/protocol',
    '-I=src/views/inspector/protocol',
    'src/views/inspector/protocol/services.proto'
  ]

  const isWindows = (process.platform === "win32" || opsys === "win64")

  let result
  if (isWindows) {
    result = spawnSync('npm.cmd', protocNpmArgs.map(item => item.replace(/\//g, '\\')), {
      encoding: 'utf-8'
    })
  } else {
    resulst = spawnSync('npm', protocNpmArgs)
  }

  if (result.stderr.length > 0) {
    throw new Error('Error while generating protocol buffers. ' + result.stderr)
  }

  console.log('Generating .proto services... OK')
}

// I took this from here: https://github.com/evanw/esbuild/issues/1051#issuecomment-806325487
const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args) => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }))

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args) => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }))

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, (args) => ({
      path: args.path,
      namespace: 'file',
    }))

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions
    opts.loader = opts.loader || {}
    opts.loader['.node'] = 'file'
  },
}

const isDebug = process.argv.some((arg) => arg === '--debug')

compileProtocolBuffer()

build({
  platform: 'node',
  bundle: true,
  minify: !isDebug,
  sourcemap: isDebug ? 'both' : undefined,
  plugins: [nativeNodeModulesPlugin],
  entry: 'src/extension.ts',
  outfile: 'dist/extension.js',
  tsconfig: 'tsconfig.json',
  external: ['vscode'],
})
