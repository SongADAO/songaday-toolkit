import { ensureDir, pathFromKey, projectPath } from '@/utils/generator/helpers'
import {
  formatBeard,
  formatInstrument,
  formatLocation,
  formatMood,
  formatRecord,
  formatTopic,
  getBackground,
  resolveTopic,
} from '@/utils/generator/image'
import withSession from '@/utils/withSession'
import { existsSync, writeFileSync } from 'fs'
import { trim } from 'lodash'
import { DateTime } from 'luxon'
import pMap from 'p-map'
import { join } from 'path'

type SongCSVType = {
  number: string
  date: string
  title: string
  location: string
  'all instruments': string
  'all styles'?: string
  beard: string
  genre: string
  inKey: string
  layerorder: string
  length: string
  'main instrument': string
  'main style'?: string
  mood: string
  'other instruments'?: string
  'other styles'?: string
  noun?: string
  'proper noun'?: string
  tempo: string
  topic: string
  videoID: string
}

export default withSession<{ image: string }>(async (req, res) => {
  const songs: SongCSVType[] = req.body.csv
  const imageFolderHash = req.body.imageFolderHash
  const videoFolderHash = req.body.videoFolderHash

  const errors: string[] = []
  let counter = 0
  for (const song of songs) {
    counter++
    const indexStr = song.number ? `Song - ${song.number}` : `Row - ${counter}`
    const requiredSongAttributes = [
      'number',
      'date',
      'title',
      'location',
      'all instruments',
      'beard',
      'genre',
      'inKey',
      'layerorder',
      'length', // TODO: add length later after debugging
      'main instrument',
      'mood',
      'tempo', // TODO: add tempo later after debugging
      'topic',
      'videoID',
    ]

    requiredSongAttributes.forEach((attr) => {
      // @ts-ignore
      if (!song[attr]) {
        errors.push(`${indexStr}: Missing ${attr}`)
      }
    })

    const date = DateTime.fromFormat(song.date, 'M/d/yyyy')
    const year = date.year - 2008
    const mood = formatMood(song.mood)
    const beard = formatBeard(song.beard)
    const location = formatLocation(song.location)
    const topic = formatTopic(song.topic)
    const dateStr = date.toISODate()
    const background = getBackground(year, dateStr)
    const instrument = formatInstrument(song['main instrument'])

    // check if all the attribute layers are present.
    if (!background.startsWith('#')) {
      const backgroundPath = pathFromKey(year, 'special', background)
      const bgExists = existsSync(backgroundPath)
      if (!bgExists) {
        errors.push(
          `${indexStr}: Missing background layer for ${background}, looking for ${backgroundPath}`
        )
      }
    }

    // TODO: create a generate metadata section that takes the image and the video cid hash and the csv again.

    const locationPath = pathFromKey(year, 'location', location)
    const locationExists = existsSync(locationPath)
    if (!locationExists) {
      errors.push(
        `${indexStr}: Missing location layer for ${location}, looking for ${locationPath}`
      )
    }

    const moodPath = pathFromKey(year, 'mood', mood)
    const moodExists = existsSync(moodPath)
    if (!moodExists) {
      errors.push(
        `${indexStr}: Missing mood layer for ${mood}, looking for ${moodPath}`
      )
    }

    const beardPath = pathFromKey(year, 'beard', beard)
    const beardExists = existsSync(beardPath)
    if (!beardExists) {
      errors.push(
        `${indexStr}: Missing beard layer for ${beard}, looking for ${beardPath}`
      )
    }

    const topicPath = pathFromKey(
      year,
      'topic',
      resolveTopic(year, topic, dateStr)
    )
    const topicExists = existsSync(topicPath)
    if (!topicExists) {
      errors.push(
        `${indexStr}: Missing topic layer for ${topic}, looking for ${topicPath}`
      )
    }

    if (instrument !== 'Vocals') {
      const instrumentPath = pathFromKey(year, 'instrument', instrument)
      const instrumentExists = existsSync(instrumentPath)
      if (!instrumentExists) {
        errors.push(
          `${indexStr}: Missing instrument layer for ${instrument}, looking for ${instrumentPath}`
        )
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  ensureDir(join(projectPath, `/output/bulk/metadata`))

  try {
    await pMap(
      songs,
      async (song) => {
        const date = DateTime.fromFormat(song.date, 'M/d/yyyy')
        const year = date.year - 2008
        const dateStr = date.toISODate()
        const background = getBackground(year, dateStr)
        const attributes = {
          songNbr: parseInt(song.number),
          date: date.toFormat('yyyy-MM-dd'),
          title: formatRecord(song.title),
          location: formatRecord(song.location),
          topic: formatRecord(song.topic),
          mood: formatRecord(song.mood),
          instrument: formatRecord(song['main instrument']),
          otherInstruments: formatRecord(song['other instruments'] ?? ''),
          beard: formatRecord(song.beard),
          genre: formatRecord(song.genre),
          style: formatRecord(song['main style'] ?? ''),
          otherStyles: formatRecord(song['other styles'] ?? ''),
          noun: formatRecord(song.noun ?? ''),
          properNoun: formatRecord(song['proper noun'] ?? ''),
          videoUrl: formatRecord(song.videoID),
          length: formatRecord(song['length']),
          inKey: formatRecord(song.inKey),
          tempo: formatRecord(song.tempo),
          year,
          background,
        }

        const tokenId = song.number

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
            value: DateTime.fromFormat(
              attributes.date,
              'yyyy-MM-dd'
            ).year.toString(),
          },
        ]

        const attributePusher = (name: string, value: string) => {
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
          description: `Song A Day is an ever-growing collection of unique songs created by Jonathan Mann, starting on January 1st, 2009. Each NFT is a 1:1 representation of that day’s song, and grants access to SongADAO, the organization which owns all rights and revenue to the songs. Own a piece of the collection to help govern the future of music. A new song, every day, forever.`,
          created_by: 'Jonathan Mann',
          token_id: Number(tokenId),
          image: `ipfs://${imageFolderHash}/${tokenId}`,
          animation_url: `ipfs://${videoFolderHash}/${tokenId}`,
          external_url: externalURL,
          youtube_url: attributes.videoUrl,
          attributes: attributesArray,
        }

        writeFileSync(
          join(projectPath, `/output/bulk/metadata/metadata_${tokenId}.json`),
          JSON.stringify(metadata)
        )
      },
      { concurrency: 25 }
    )
  } catch (error) {
    throw error
  }

  res.status(200).json({ image: `data:image/png;base64` })
})

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
}
