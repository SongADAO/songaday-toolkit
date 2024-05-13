import { getSongFromOpenSea, getSongFromAllMetadata } from '@/utils/metadata'
import withSession from '@/utils/withSession'
import algoliasearch from 'algoliasearch'
import externalConfig from '../../config.json'

export default withSession<any>(async (req, res) => {
  if (req.method === 'GET') {
    const { token_id } = req.query
    // add to algolia index
    const client = algoliasearch(
      externalConfig.ALGOLIA_APPLICATION_ID,
      externalConfig.ALGOLIA_ADMIN_KEY
    )
    const index = client.initIndex('songs')

    let song
    try {
      song = await getSongFromAllMetadata(token_id.toString())
      console.log(song)
    } catch (e) {
      console.log(
        `token ${token_id}, no metadata in all-metadata, trying OS API`
      )

      // prevent OS API rate limit
      await new Promise((resolve) => setTimeout(resolve, 400))

      song = await getSongFromOpenSea(token_id.toString())
    }

    if (song) {
      console.log('Song found: ', token_id)
      await index.saveObject(song)
    }

    return res.status(200).json({ success: true })
  } else {
    return res.status(404).json({ success: false })
  }
})
