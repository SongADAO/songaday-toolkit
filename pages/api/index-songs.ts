import withSession from '@/utils/withSession'
import { orderBy } from 'lodash'
import algoliasearch from 'algoliasearch'
import externalConfig from '../../config.json'
import {
  getJson,
  getSongFromOpenSea,
  getSongWithObjectId,
  SongMetadata,
} from '@/utils/metadata'

const DAILY_MINT_START = 4749

export default withSession<any>(async (req, res) => {
  if (req.method === 'GET') {
    // add to algolia index
    const client = algoliasearch(
      externalConfig.ALGOLIA_APPLICATION_ID,
      externalConfig.ALGOLIA_ADMIN_KEY
    )
    const index = client.initIndex('songs')
    // parse a json file from url

    const songs = await getJson<Record<string, SongMetadata>>(
      'https://jonathanmannmachine.s3.us-west-2.amazonaws.com/sadsongs.json'
    )
    const orderedSongs = orderBy(Object.values(songs), ['token_id'], ['asc'])
    const withObjectId = orderedSongs.map(getSongWithObjectId)
    const records = withObjectId
    try {
      await index.saveObjects(records)
    } catch (error) {
      console.log('error', { error })
    }

    let stop = false
    let token_id = DAILY_MINT_START
    while (!stop) {
      const song = await getSongFromOpenSea(token_id.toString())
      if (song) {
        console.log('Song found: ', token_id)
        await index.saveObject(song)
        token_id += 1
      } else {
        stop = true
      }
    }

    return res.status(200).json({ success: true })
  } else {
    return res.status(404).json({ success: false })
  }
})
