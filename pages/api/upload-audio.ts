import withSession from '@/utils/withSession'
import formidable from 'formidable'
import { copyFileSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { ensureDir, projectPath } from '@/utils/generator/helpers'
import { last } from 'lodash'
import { nanoid } from 'nanoid'
import { NFTStorage } from 'nft.storage'
import { Blob } from '@web-std/file'
import externalConfig from '../../config.json'

export default withSession<{ hash: string }>(async (req, res) => {
  // @ts-ignore
  const { files, fields } = await new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 1024 * 1024 * 1024 * 30,
    })
    form.parse(req, function (err, fields, files) {
      if (err) return reject(err)
      resolve({ files, fields })
    })
  })

  if (!files || files.length === 0) {
    throw new Error('No files were uploaded')
  }

  const fileExt = `${last(files.file.originalFilename.split('.'))}`

  const newFilePath = join(
    os.tmpdir(),
    `audio_${fields.songNbr}_${nanoid(6)}.${last(
      files.file.originalFilename.split('.')
    )}`
  )

  // rename the file so that its easier to browse assets on nft.storage
  renameSync(files.file.filepath, newFilePath)
  const nftStorageClient = new NFTStorage({
    token: String(externalConfig.NFTSTORAGE_API_KEY),
  })
  const fileBuffer = readFileSync(newFilePath)
  const blob = new Blob([fileBuffer])
  const ipfsHash = await nftStorageClient.storeBlob(blob)

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/audio_hash.txt`),
    ipfsHash
  )

  // copy the file to another folder for safe keeping
  ensureDir(join(externalConfig.SAVE_ASSET_FOLDER_ROOT, '/audios'))
  copyFileSync(
    newFilePath,
    join(
      externalConfig.SAVE_ASSET_FOLDER_ROOT,
      `/audios/${fields.songNbr}.${fileExt}`
    )
  )

  res.status(200).json({ hash: ipfsHash })
})

export const config = {
  api: {
    bodyParser: false,
  },
}
