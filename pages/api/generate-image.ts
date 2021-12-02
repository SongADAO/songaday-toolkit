import { MISSING_INSTRUMENTS_FOR_YEAR } from '@/utils/generator/constants'
import {
  composite,
  ensureDir,
  pathFromKey,
  projectPath,
  skip,
  tempBackgroundColor,
} from '@/utils/generator/helpers'
import { readFileSync, renameSync, writeFileSync } from 'fs'
import withSession from '@/utils/withSession'
import tempy from 'tempy'
import { join } from 'path'
import {
  formatBeard,
  formatInstrument,
  formatLocation,
  formatMood,
  formatTopic,
  getBackground,
  resolveTopic,
} from '@/utils/generator/image'
import { DateTime } from 'luxon'
import { compact, last, trim } from 'lodash'

export default withSession<{ image: string }>(async (req, res) => {
  console.log(JSON.parse(req.body))

  const record = JSON.parse(req.body)

  const songNbr = parseInt(record.songNbr)
  const description = trim(record.description).replace(/^N\/A$/, '')
  const isQueryParam = record.videoUrl.includes('?v=')
  const videoUrl = isQueryParam
    ? last(record.videoUrl.split('?v='))
    : last(record.videoUrl.split('/'))
  const instruments = compact(
    trim(record.otherInstruments).split(',').map(formatInstrument)
  )

  // TODO: Add composite based on the order of the layers.

  const date = DateTime.fromFormat(record.date, 'yyyy-MM-dd')
  const year = date.year - 2008
  const mood = formatMood(record.mood)
  const beard = formatBeard(record.beard)
  const location = formatLocation(record.location)
  const topic = formatTopic(record.topic)
  const dateStr = date.toISODate()
  const background = getBackground(year, dateStr)
  const title = record.title
  const genre = record.genre

  const instrument = formatInstrument(record.instrument)

  ensureDir(join(projectPath, `/output/${songNbr}`))
  if (MISSING_INSTRUMENTS_FOR_YEAR[year].includes(instrument))
    return skip(songNbr.toString(), 'instrument', instrument)

  const temp = tempy.file({ extension: 'png' })
  const final = join(projectPath, `/output/${songNbr}/image_${songNbr}.png`)

  const newBackground = background.startsWith('#')
    ? await tempBackgroundColor(background)
    : pathFromKey(year, 'special', background)
  const locationPath = pathFromKey(year, 'location', location)
  const topicPath = pathFromKey(
    year,
    'topic',
    resolveTopic(year, topic, dateStr)
  )
  const moodPath = pathFromKey(year, 'mood', mood)
  const beardPath = pathFromKey(year, 'beard', beard)

  await composite(newBackground, locationPath, temp)
  await composite(temp, topicPath, temp)
  await composite(temp, moodPath, temp)
  await composite(temp, beardPath, temp)

  if (instrument !== 'Vocals') {
    const instrumentPath = pathFromKey(year, 'instrument', instrument)
    await composite(temp, instrumentPath, temp)
  }

  renameSync(temp, final)

  const base64Image = readFileSync(final, { encoding: 'base64' })

  const attrs = {
    songNbr,
    description,
    videoUrl,
    instruments,
    date,
    year,
    mood,
    beard,
    location,
    topic,
    background,
    instrument,
    title,
    genre,
  }

  writeFileSync(
    join(projectPath, `/output/${songNbr}/attributes.json`),
    JSON.stringify(attrs)
  )
  res.status(200).json({ image: `data:image/png;base64, ${base64Image}` })
})
