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
      name: 'From Github Repository',
      sceneParam: 'github-repo',
    },
    {
      name: 'Library',
      sceneParam: 'library',
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
    const value = 'https://github.com/decentraland/sdk7-goerli-plaza/tree/main/Cube'
    githubRepo = await vscode.window.showInputBox({
      valueSelection: [0, value.length],
      value,
      prompt: 'See https://studios.decentraland.org/resoruces for examples, use “View Code” links\n',
      title: 'Paste the full URL to a Decentraland project on Github to clone it.',
      placeHolder: value,
    })
    if (!githubRepo) return
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
