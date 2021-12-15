import {
  composite,
  ensureDir,
  pathFromKey,
  projectPath,
  tempBackgroundColor,
} from '@/utils/generator/helpers'
import {
  formatBeard,
  formatInstrument,
  formatLocation,
  formatMood,
  formatNoun,
  formatShirt,
  formatTopic,
  getBackground,
  resolveTopic,
} from '@/utils/generator/image'
import withSession from '@/utils/withSession'
import { existsSync } from 'fs'
import { trim } from 'lodash'
import { DateTime } from 'luxon'
import pMap from 'p-map'
import { join } from 'path'
import sharp from 'sharp'
import tempy from 'tempy'

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
  shirt?: string
  tempo: string
  topic: string
  videoID: string
}

export default withSession<{ image: string }>(async (req, res) => {
  const songs: SongCSVType[] = req.body.csv
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

  try {
    await pMap(
      songs,
      async (song) => {
        const date = DateTime.fromFormat(song.date, 'M/d/yyyy')
        const year = date.year - 2008
        const mood = formatMood(song.mood)
        const beard = formatBeard(song.beard)
        const location = formatLocation(song.location)
        const topic = formatTopic(song.topic)
        const dateStr = date.toISODate()
        const background = getBackground(year, dateStr)
        const songNbr = parseInt(song.number)
        const instrument = formatInstrument(song['main instrument'])
        const noun = formatNoun(song.noun ?? '')
        const shirt = formatShirt(song.shirt ?? '')
        const layerorder = song.layerorder
          .split(',')
          .map((x) => trim(x).toLowerCase())

        ensureDir(join(projectPath, `/output/bulk/images`))

        const temp = tempy.file({ extension: 'png' })
        const final = join(
          projectPath,
          `/output/bulk/images/image_${songNbr}.png`
        )
        const newBackground = background.startsWith('#')
          ? await tempBackgroundColor(background)
          : pathFromKey(year, 'special', background)
        // base layer
        await composite(newBackground, newBackground, temp)

        const getLayerPath = (order: number) => {
          const type = layerorder[order]
          if (type === 'location') {
            const locationPath = pathFromKey(year, 'location', location)
            return locationPath
          }
          if (type === 'topic') {
            const topicPath = pathFromKey(
              year,
              'topic',
              resolveTopic(year, topic, dateStr)
            )
            return topicPath
          }
          if (type === 'mood') {
            const moodPath = pathFromKey(year, 'mood', mood)
            return moodPath
          }
          if (type === 'beard') {
            const beardPath = pathFromKey(year, 'beard', beard)
            return beardPath
          }
          if (type === 'instrument' && instrument !== 'Vocals') {
            const instrumentPath = pathFromKey(year, 'instrument', instrument)
            return instrumentPath
          }
          if (type === 'backgroundadjustlayer') {
            const backgroundAdjustPath = join(
              projectPath,
              `/layers/${year}/backgroundadjustlayer.png`
            )
            return backgroundAdjustPath
          }
          if (type === 'frametoplayer') {
            const backgroundAdjustPath = join(
              projectPath,
              `/layers/${year}/FrameTopLayer.png`
            )
            return backgroundAdjustPath
          }

          if (type === 'shirt') {
            const shirtPath = pathFromKey(year, 'shirt', shirt)
            return shirtPath
          }

          if (type === 'noun') {
            const nounPath = pathFromKey(year, 'noun', noun)
            return nounPath
          }
          return ''
        }
        getLayerPath(1) && (await composite(temp, getLayerPath(1), temp))
        getLayerPath(2) && (await composite(temp, getLayerPath(2), temp))
        getLayerPath(3) && (await composite(temp, getLayerPath(3), temp))
        getLayerPath(4) && (await composite(temp, getLayerPath(4), temp))
        getLayerPath(5) && (await composite(temp, getLayerPath(5), temp))
        getLayerPath(6) && (await composite(temp, getLayerPath(6), temp))
        getLayerPath(7) && (await composite(temp, getLayerPath(7), temp))
        getLayerPath(8) && (await composite(temp, getLayerPath(8), temp))
        getLayerPath(9) && (await composite(temp, getLayerPath(9), temp))
        getLayerPath(10) && (await composite(temp, getLayerPath(10), temp))

        await sharp(temp)
          .png({
            quality: 100,
          })
          .toFile(final)
      },
      { concurrency: 25 }
    )
  } catch (error) {
    throw error
  }

  res.status(200).json({ image: `data:image/png;base64` })
})
