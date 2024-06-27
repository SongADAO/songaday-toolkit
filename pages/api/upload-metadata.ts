import { ensureDir, projectPath } from '@/utils/generator/helpers'
import withSession from '@/utils/withSession'
import formidable from 'formidable'
import { copyFileSync, readFileSync, writeFileSync } from 'fs'
import { trim } from 'lodash'
import { DateTime } from 'luxon'
import pinataSDK from '@pinata/sdk'
import { join } from 'path'
import externalConfig from '../../config.json'

export default withSession<{ hash: string }>(async (req, res) => {
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

  const attributesStr = readFileSync(files.file.filepath, 'utf8')
  const attributes = JSON.parse(attributesStr)
  const tokenId = fields.songNbr
  const externalURL = 'https://songaday.world/song/' + tokenId
  const attributesArray = [
    { trait_type: 'Date', value: attributes.date },
    {
      trait_type: 'Location',
      value: attributes.location,
    },
    {
      trait_type: 'Topic',
      value: attributes.topic,
    },
    {
      trait_type: 'Instrument',
      value: attributes.instrument,
    },
    {
      trait_type: 'Mood',
      value: attributes.mood,
    },
    {
      trait_type: 'Beard',
      value: attributes.beard,
    },
    {
      trait_type: 'Genre',
      value: attributes.genre,
    },
    {
      trait_type: 'Style',
      value: attributes.style,
    },
    {
      trait_type: 'Length',
      value: attributes['length'],
    },
    {
      trait_type: 'Key',
      value: attributes.inKey,
    },
    {
      trait_type: 'Tempo',
      value: attributes.tempo,
    },
    {
      trait_type: 'Song A Day',
      value: tokenId.toString(),
    },
    {
      trait_type: 'Year',
      value: DateTime.fromFormat(attributes.date, 'yyyy-MM-dd').year.toString(),
    },
  ]

  if (attributes?.soundxyzContract) {
    attributesArray.push({
      trait_type: 'Sound.xyz Edition Contract',
      value: attributes?.soundxyzContract,
    })
  }

  const attributePusher = (name: string, value: string | number) => {
    if (value) {
      attributesArray.push({ trait_type: name, value })
    }
  }
  attributes.otherInstruments
    ?.split(',')
    ?.map((ins: string) => attributePusher('Instrument', trim(ins)))

  attributes.otherStyles
    ?.split(',')
    ?.map((st: string) => attributePusher('Style', trim(st)))
  attributePusher('Noun', attributes.noun)
  attributePusher('Proper Noun', attributes.properNoun)

  const metadata = {
    name: attributes.title,
    description: attributes.description,
    created_by: 'Jonathan Mann',
    token_id: Number(tokenId),
    image: `ipfs://${fields.imageHash}`,
    animation_url: `ipfs://${fields.videoHash}`,
    audio_url: `ipfs://${fields.audioHash}`,
    external_url: externalURL,
    youtube_url: attributes.videoUrl,
    attributes: attributesArray,
  }

  const pinata = new pinataSDK({
    pinataJWTKey: String(externalConfig.PINATA_JWT),
  })
  // const pinata = new pinataSDK({
  //   pinataApiKey: String(externalConfig.PINATA_API_KEY),
  //   pinataSecretApiKey: String(externalConfig.PINATA_SECRET_API_KEY),
  // })
  const pinataRes = await pinata.pinJSONToIPFS(metadata, {
    pinataMetadata: {
      name: `${fields.songNbr}.json`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  })
  const ipfsHash = pinataRes.IpfsHash

  ensureDir(join(projectPath, `/output/${fields.songNbr}`))

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/metadata_hash.txt`),
    ipfsHash
  )

  writeFileSync(
    join(projectPath, `/output/${fields.songNbr}/metadata.json`),
    JSON.stringify(metadata)
  )

  // copy the file to another folder for safe keeping
  ensureDir(join(externalConfig.SAVE_ASSET_FOLDER_ROOT, '/metadatas'))
  copyFileSync(
    join(projectPath, `/output/${fields.songNbr}/metadata.json`),
    join(
      externalConfig.SAVE_ASSET_FOLDER_ROOT,
      `/metadatas/${fields.songNbr}.json`
    )
  )

  res.status(200).json({ hash: ipfsHash })
})

export const config = {
  api: {
    bodyParser: false,
  },
}
