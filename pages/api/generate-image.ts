import { MISSING_INSTRUMENTS_FOR_YEAR } from '@/utils/generator/constants'
import {
  composite,
  ensureDir,
  pathFromKey,
  projectPath,
  skip,
  tempBackgroundColor,
} from '@/utils/generator/helpers'
import { readFileSync, writeFileSync } from 'fs'
import withSession from '@/utils/withSession'
import tempy from 'tempy'
import { join } from 'path'
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
import { DateTime } from 'luxon'
import { findKey, trim } from 'lodash'
import sharp from 'sharp'
import formidable from 'formidable'

export default withSession<{ image: string }>(async (req, res) => {
  try {
    // @ts-ignore
    const { files, fields } = await new Promise(function (resolve, reject) {
      const form = new formidable.IncomingForm({ keepExtensions: true })
      form.parse(req, function (err, fields, files) {
        if (err) return reject(err)
        resolve({ files, fields })
      })
    })
    const record = JSON.parse(fields.data)
    const songNbr = parseInt(record.songNbr)
    ensureDir(join(projectPath, `/output/${songNbr}`))

    const date = DateTime.fromFormat(record.date, 'yyyy-MM-dd')
    const year = date.year - 2008
    const mood = formatMood(record.mood)
    const beard = formatBeard(record.beard)
    const location = formatLocation(record.location)
    const topic = formatTopic(record.topic)
    const dateStr = date.toISODate()
    const background = getBackground(year, dateStr)
    const layer = record.layer

    const instrument = formatInstrument(record.instrument)

    if (MISSING_INSTRUMENTS_FOR_YEAR[year]?.includes(instrument))
      return skip(songNbr.toString(), 'instrument', instrument)

    const temp = tempy.file({ extension: 'png' })
    const final = join(projectPath, `/output/${songNbr}/image_${songNbr}.png`)

    const hasCustomImage = Boolean(files?.file?.originalFilename)
    console.log({ hasCustomImage, files })
    if (hasCustomImage) {
      await composite(files.file.filepath, files.file.filepath, final)
    } else {
      const newBackground = background.startsWith('#')
        ? await tempBackgroundColor(background)
        : pathFromKey(year, 'special', background)
      // base layer
      await composite(newBackground, newBackground, temp)

      const getLayerPath = (order: number) => {
        const type = findKey(layer, (o) => o === order.toString()) ?? ''
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
        return ''
      }

      getLayerPath(0) && (await composite(temp, getLayerPath(0), temp))
      getLayerPath(1) && (await composite(temp, getLayerPath(1), temp))
      getLayerPath(2) && (await composite(temp, getLayerPath(2), temp))
      getLayerPath(3) && (await composite(temp, getLayerPath(3), temp))
      getLayerPath(4) && (await composite(temp, getLayerPath(4), temp))
      await sharp(temp)
        .png({
          quality: 100,
        })
        .toFile(final)
    }

    const base64Image = readFileSync(final, { encoding: 'base64' })

    const description = trim(record.description).replace(/^N\/A$/, '')

    const attrs = {
      songNbr,
      date: date.toFormat('yyyy-MM-dd'),
      title: formatRecord(record.title),
      description,
      location: formatRecord(record.location),
      topic: formatRecord(record.topic),
      mood: formatRecord(record.mood),
      instrument: formatRecord(record.instrument),
      otherInstruments: formatRecord(record.otherInstruments),
      beard: formatRecord(record.beard),
      genre: formatRecord(record.genre),
      style: formatRecord(record.style),
      otherStyles: formatRecord(record.otherStyles),
      noun: formatRecord(record.noun),
      properNoun: formatRecord(record.properNoun),
      videoUrl: formatRecord(record.videoUrl),
      length: formatRecord(record['length']),
      inKey: formatRecord(record.inKey),
      tempo: formatRecord(record.tempo),
      year,
      background,
    }

    writeFileSync(
      join(projectPath, `/output/${songNbr}/attributes.json`),
      JSON.stringify(attrs)
    )
    res.status(200).json({ image: `data:image/png;base64, ${base64Image}` })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: (error as any).message } as any)
  }
})

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}
