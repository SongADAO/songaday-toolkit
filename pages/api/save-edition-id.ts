import withSession from '@/utils/withSession'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ensureDir, projectPath } from '@/utils/generator/helpers'

export default withSession<{ success: boolean }>(async (req, res) => {
  const { songNbr, editionTokenId } = req.query

  if (!songNbr || !editionTokenId) {
    return res.status(400).json({ success: false })
  }

  const outputPath = join(
    projectPath,
    `/output/${songNbr}/edition_token_id.txt`
  )

  if (existsSync(outputPath)) {
    return res.status(400).json({ success: false })
  }

  ensureDir(join(projectPath, `/output/${songNbr}`))

  writeFileSync(outputPath, editionTokenId as string)

  res.status(200).json({ success: true })
})

export const config = {
  api: {
    bodyParser: false,
  },
}
