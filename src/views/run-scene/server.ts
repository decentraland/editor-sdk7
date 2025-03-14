import { ProgressLocation } from 'vscode'
import { npmInstall } from '../../modules/npm'
import { bin } from '../../modules/bin'
import { SpanwedChild } from '../../modules/spawn'
import { log } from '../../modules/log'
import { loader } from '../../modules/loader'
import { hasNodeModules } from '../../modules/workspace'
import { syncSdkVersion } from '../../modules/sdk'
import { Server } from '../../modules/server'
import { ServerName } from '../../types'
import { useCreatorHubMessage } from '../../utils'

class RunSceneServer extends Server {
  child: SpanwedChild | null = null
  constructor() {
    super(ServerName.RunScene)
  }

  async onStart() {
    const a = true
    if (a) {
      return useCreatorHubMessage()
    }
    // install dependencies
    if (!hasNodeModules()) {
      await npmInstall()
    }
    // sync sdk version with workspace
    await syncSdkVersion()

    // start scene preview server
    this.child = bin('npm', 'npm', [
      'start',
      '--',
      `--port ${await this.getPort()}`,
      '--no-browser',
      '--skip-install',
      '--data-layer',
    ])

    this.child.process.on('close', async (code) => {
      if (code !== null) {
        log(`RunScene: http server closed with status code ${code}`)
      }
      await this.stop()
    })

    // Show loader while server is starting
    await loader(
      'Starting server...',
      async () =>
        Promise.race([
          this.child!.waitFor(/server is now running/gi),
          this.child!.wait(),
        ]),
      ProgressLocation.Window
    )
  }

  async onStop() {
    if (this.child && this.child.alive()) {
      await this.child.kill()
    }
  }
}

export const runSceneServer = new RunSceneServer()
