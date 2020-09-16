// desktopCapturer: electron already has a screen capture tool
// remote: inter process communication: IPC -- used to create native popup menu
const { desktopCapturer, remote } = require('electron')
const { dialog, Menu } = remote

const { writeFile } = require('fs')

const mainElement = document.querySelector('main')
const videoElement = document.querySelector('video')
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const videoSelectBtn = document.getElementById('videoSelectBtn')

// global
// media recorder instance to capture footage
let mediaRecorder
const recordedChunks = []

// buttons

startBtn.onclick = (e) => {
  mediaRecorder.start()
  startBtn.classList.add('is-danger')
  startBtn.innerText = 'Recording'
}

stopBtn.onclick = (e) => {
  mediaRecorder.stop()
  startBtn.classList.remove('is-danger')
  startBtn.innerText = 'Start'
}

videoSelectBtn.onclick = getVideoSources

// functions

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

// change the video source window to record
async function selectSource(source) {
  videoSelectBtn.innerText = source.name

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      },
    },
  }

  // create a stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints)

  // unhide main element
  mainElement.classList.remove('hiddenMain')
  // Preview source in the video element
  videoElement.srcObject = stream
  videoElement.play()

  // create media recorder
  const options = { mimeType: 'video/webm; codecs=vp9' }
  mediaRecorder = new MediaRecorder(stream, options)

  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.onstop = handleStop
}

function handleDataAvailable(e) {
  console.log('video data available')
  recordedChunks.push(e.data)
}

async function handleStop(e) {
  const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp9' })

  const buffer = Buffer.from(await blob.arrayBuffer())

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`,
  })

  writeFile(filePath, buffer, () => console.log('video saved successfully'))
}
