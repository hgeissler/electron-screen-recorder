const video = document.querySelector('video')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const videoSelectBtn = document.getElementById('videoSelectBtn')

// desktopCapturer: electron already has a screen capture tool
// remote: inter process communication: IPC -- used to create native popup menu
const { desktopCapturer, remote } = require('electron')
const { Menu } = remote

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
  })

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      }
    })
  )

  videoOptionsMenu.popup()
}

videoSelectBtn.onclick = getVideoSources
