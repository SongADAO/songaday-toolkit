import withSession from '@/utils/withSession'
import formidable from 'formidable'
import { copyFileSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { projectPath, ensureDir } from '@/utils/generator/helpers'
import { last } from 'lodash'
import { nanoid } from 'nanoid'
import { NFTStorage } from 'nft.storage'
import { Blob } from '@web-std/file'
import externalConfig from '../../config.json'

export default withSession<{ hash: string }>(async (req, res) => {
  const nftStorageClient = new NFTStorage({
    token: String(externalConfig.NFTSTORAGE_API_KEY),
  })
  // @ts-ignore
  const { files, fields } = await new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({ keepExtensions: true })
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
    `image_${fields.songNbr}_${nanoid(6)}.${fileExt}`
  )

  // rename the file so that its easier to browse assets on nft.storage
  renameSync(files.file.filepath, newFilePath)

  const fileBuffer = readFileSync(newFilePath)
  const blob = new Blob([fileBuffer])
  const ipfsHash = await nftStorageClient.storeBlob(blob)

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/image_hash.txt`),
    ipfsHash
  )

  // copy the file to another folder for safe keeping
  ensureDir(join(externalConfig.SAVE_ASSET_FOLDER_ROOT, '/images'))
  copyFileSync(
    newFilePath,
    join(
      externalConfig.SAVE_ASSET_FOLDER_ROOT,
      `/images/${fields.songNbr}.${fileExt}`
    )
  )

  res.status(200).json({ hash: ipfsHash })
})

export const config = {
  api: {
    bodyParser: false,
  },
}
