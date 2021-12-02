import fetchJson from '@/utils/fetchJson'
import { projectPath } from '@/utils/generator/helpers'
import withSession from '@/utils/withSession'
import formidable from 'formidable'
import { readFileSync, writeFileSync } from 'fs'
import { nanoid } from 'nanoid'
import { join } from 'path'

export default withSession<{ hash: string }>(async (req, res) => {
  const { files, fields } = await new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({ keepExtensions: true })
    form.parse(req, function (err, fields, files) {
      if (err) return reject(err)
      resolve({ files, fields })
    })
  })

  console.log(fields)

  if (!files || files.length === 0) {
    throw new Error('No files were uploaded')
  }

  const attributesStr = readFileSync(files.file.filepath, 'utf8')
  const attributes = JSON.parse(attributesStr)
  const tokenId = fields.songNbr
  const externalURL = 'https://songaday.world/song/' + tokenId
  const metadata = {
    pinataMetadata: {
      name: `metadata_${tokenId}__${nanoid(6)}.json`,
    },
    pinataContent: {
      name: attributes.title,
      created_by: 'Jonathan Mann',
      description: 'A new song, every day. Forever.',
      external_url: externalURL,
      token_id: tokenId,
      image: fields.imageHash,
      animation: fields.videoHash,
      attributes: [
        {
          trait_type: 'Genre',
          value: attributes.genre,
        },
        {
          trait_type: 'Instrument',
          value: attributes.instrument,
        },
        {
          trait_type: 'Location',
          value: attributes.location,
        },
        {
          trait_type: 'Mood',
          value: attributes.mood,
        },
        {
          trait_type: 'Song A Day',
          value: tokenId.toString(),
        },
        {
          trait_type: 'Topic',
          value: attributes.topic,
        },
        {
          trait_type: 'Year',
          value: attributes.year.toString(),
        },
      ],
    },
  }

  console.log(JSON.stringify(metadata, null, 2))

  const response = await fetchJson<{ IpfsHash: string }>(
    process.env.PINATA_BASE_URI + '/pinJSONToIPFS',
    {
      method: 'POST',
      // @ts-ignore
      body: JSON.stringify(metadata),
      headers: {
        'Content-type': 'application/json',
        pinata_api_key: String(process.env.PINATA_API_KEY),
        pinata_secret_api_key: String(process.env.PINATA_SECRET_KEY),
      },
    }
  )

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/metadata_hash.txt`),
    response.IpfsHash
  )

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/metadata.json`),
    JSON.stringify(metadata.pinataContent)
  )

  res.status(200).json({ hash: response.IpfsHash })
})

export const config = {
  api: {
    bodyParser: false,
  },
}
