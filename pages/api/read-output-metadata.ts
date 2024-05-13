import { getSongFromOutputMetadata } from '@/utils/metadata'
import withSession from '@/utils/withSession'

export default withSession<any>(async (req, res) => {
  if (req.method === 'GET') {
    const { token_id } = req.query

    const song = await getSongFromOutputMetadata(token_id.toString())
    if (!song) {
      throw new Error('could not find song output metadata')
    }

    return res.status(200).json(song)
  } else {
    return res.status(404).json({ success: false })
  }
})
