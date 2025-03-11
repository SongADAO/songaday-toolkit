import withSession from '@/utils/withSession'
import { readFileSync } from 'fs'
import { join } from 'path'
import { ensureDir, projectPath } from '@/utils/generator/helpers'

export default withSession<{ success: boolean; editionTokenId: number }>(
  async (req, res) => {
    const { songNbr } = req.query

    if (!songNbr) {
      return res.status(400).json({ success: false, editionTokenId: 0 })
    }

    const editionTokenId = readFileSync(
      join(projectPath, `/output/${songNbr}/edition_token_id.txt`)
    )

    res.status(200).json({
      success: true,
      editionTokenId: Number(String(editionTokenId).trim()),
    })
  }
)

export const config = {
  api: {
    bodyParser: false,
  },
}
