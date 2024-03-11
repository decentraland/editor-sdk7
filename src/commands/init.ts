import * as vscode from 'vscode'
import { loader } from '../modules/loader'
import { npmInstall } from '../modules/npm'
import { bin } from '../modules/bin'

export async function init() {
  const scaffoldedScenesOptions = [
    {
      name: 'Standard project',
      sceneParam: 'scene-template',
    },
    {
      name: 'Portable experience',
      sceneParam: 'px-template',
    },
    {
      name: 'Smart Wearable',
      sceneParam: 'smart-wearable',
    },
    {
      name: 'Github Repository',
      sceneParam: 'github-repo',
    },
  ] as const

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

  let githubRepo: string | undefined
  if (scaffoldedScene.sceneParam === 'github-repo' ) {
    githubRepo = await vscode.window.showInputBox({
      title: 'Insert github repository url _(or subfolder link)_',
      placeHolder: 'https://github.com/decentraland/sdk7-goerli-plaza/tree/main/Cube'
    })
  }

  const opts = githubRepo
    ? ['--github-repo', githubRepo]
    : ['--project', scaffoldedScene.sceneParam]
  const child = bin('@dcl/sdk-commands', 'sdk-commands', [
    'init',
    '--skip-install',
    ...opts
  ])

  await loader(
    `Creating project...`,
    () => child.wait(),
    vscode.ProgressLocation.Notification
  )

  await npmInstall()

  vscode.window.showInformationMessage('Project created successfully!')
}
