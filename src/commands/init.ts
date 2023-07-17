import * as vscode from 'vscode'
import { loader } from '../modules/loader'
import { npmInstall } from '../modules/npm'
import { bin } from '../modules/bin'

export async function init() {
  // TODO: should we get the options from sdk-commands?
  const scaffoldedScenesOptions = [
    {
      name: 'Standard project',
      sceneParam: 'scene-template',
    },
    {
      name: 'Portable experience',
      sceneParam: 'px-template',
    },
  ]

  const selected = await vscode.window.showQuickPick(
    scaffoldedScenesOptions.map((item) => item.name),
    {
      ignoreFocusOut: true,
      title: 'Create Project',
      placeHolder: 'Select the project type',
    }
  )

  if (!selected) {
    return
  }
  const scaffoldedScene = scaffoldedScenesOptions.find(
    (option) => option.name === selected
  )!

  const child = bin('@dcl/sdk-commands', 'sdk-commands', [
    'init',
    '--skip-install',
    '--project',
    scaffoldedScene.sceneParam,
  ])

  await loader(
    `Creating project...`,
    () => child.wait(),
    vscode.ProgressLocation.Notification
  )

  await npmInstall()

  vscode.window.showInformationMessage('Project created successfully!')
}
