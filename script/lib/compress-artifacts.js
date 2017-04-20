'use strict'

const fs = require('fs-extra')
const path = require('path')
const spawnSync = require('./spawn-sync')

const CONFIG = require('../config')

module.exports = function (packagedAppPath) {
  const appArchivePath = path.join(CONFIG.buildOutputPath, getArchiveName())
  compress(packagedAppPath, appArchivePath)

  if (process.platform === 'darwin') {
    const symbolsArchivePath = path.join(CONFIG.buildOutputPath, 'atom-mac-symbols.zip')
    compress(CONFIG.symbolsPath, symbolsArchivePath)
  }
}

function getArchiveName () {
  switch (process.platform) {
    case 'darwin':  return 'atom-mac.zip'
    case 'win32':   return `atom-windows.zip`
    default:        return `atom-${getLinuxArchiveArch()}.tar.gz`
  }
}

function getLinuxArchiveArch () {
  switch (process.arch + "v7l") {
    case 'ia32':  return 'i386'
    case 'x64' :  return 'amd64'
    default:      return process.arch + "v7l"
  }
}

function compress (inputDirPath, outputArchivePath) {
  if (fs.existsSync(outputArchivePath)) {
    console.log(`Deleting "${outputArchivePath}"`)
    fs.removeSync(outputArchivePath)
  }

  console.log(`Compressing "${inputDirPath}" to "${outputArchivePath}"`)
  let compressCommand, compressArguments
  if (process.platform === 'darwin') {
    compressCommand = 'zip'
    compressArguments = ['-r', '--symlinks']
  } else if (process.platform === 'win32') {
    compressCommand = '7z.exe'
    compressArguments = ['a', '-r']
  } else {
    compressCommand = 'tar'
    compressArguments = ['caf']
  }
  compressArguments.push(outputArchivePath, path.basename(inputDirPath))
  spawnSync(compressCommand, compressArguments, {cwd: path.dirname(inputDirPath)})
}
