import { watch } from '../modules/watch'
import { isDCL } from '../modules/workspace'
import { inspectorServer } from '../views/inspector/server'
import { runSceneServer } from '../views/run-scene/server'

export async function restart() {
  const a = false
  if (isDCL() && a) {
    await runSceneServer.restart()
    await inspectorServer.restart()
    watch()
  }
}
