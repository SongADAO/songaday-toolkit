import fetchJson from '@/utils/fetchJson'
import withSession from '@/utils/withSession'
import formidable from 'formidable'
import { createReadStream, renameSync, writeFileSync } from 'fs'
import FormData from 'form-data'
import { join } from 'path'
import os from 'os'
import { projectPath } from '@/utils/generator/helpers'
import { last } from 'lodash'
import { nanoid } from 'nanoid'
export default withSession<{ hash: string }>(async (req, res) => {
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

  const newFilePath = join(
    os.tmpdir(),
    `image_${fields.songNbr}_${nanoid(6)}.${last(
      files.file.originalFilename.split('.')
    )}`
  )

  // rename the file so that its easier to browse assets on pinata
  renameSync(files.file.filepath, newFilePath)

  const formdata = new FormData()
  formdata.append('file', createReadStream(newFilePath))

  const response = await fetchJson<{ IpfsHash: string }>(
    process.env.PINATA_BASE_URI + '/pinFileToIPFS',
    {
      method: 'POST',
      // @ts-ignore
      body: formdata,
      headers: {
        pinata_api_key: String(process.env.PINATA_API_KEY),
        pinata_secret_api_key: String(process.env.PINATA_SECRET_KEY),
      },
    }
  )

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/image_hash.txt`),
    response.IpfsHash
  )

  res.status(200).json({ hash: response.IpfsHash })
})

export const config = {
  api: {
    bodyParser: false,
  },
}
