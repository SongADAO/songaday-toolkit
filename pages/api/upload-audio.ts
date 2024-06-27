import withSession from '@/utils/withSession'
import formidable from 'formidable'
import { copyFileSync, createReadStream, renameSync, writeFileSync } from 'fs'
import { join } from 'path'
import os from 'os'
import { ensureDir, projectPath } from '@/utils/generator/helpers'
import { last } from 'lodash'
import { nanoid } from 'nanoid'
import pinataSDK from '@pinata/sdk'
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

  // rename the file so that its easier to browse assets on pinata
  renameSync(files.file.filepath, newFilePath)

  const pinata = new pinataSDK({
    pinataJWTKey: String(externalConfig.PINATA_JWT),
  })
  // const pinata = new pinataSDK({
  //   pinataApiKey: String(externalConfig.PINATA_API_KEY),
  //   pinataSecretApiKey: String(externalConfig.PINATA_SECRET_API_KEY),
  // })
  const toPinStream = createReadStream(newFilePath)
  const pinataRes = await pinata.pinFileToIPFS(toPinStream, {
    pinataMetadata: {
      name: `${fields.songNbr}.${fileExt}`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  })
  const ipfsHash = pinataRes.IpfsHash

  ensureDir(join(projectPath, `/output/${fields.songNbr}`))

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
