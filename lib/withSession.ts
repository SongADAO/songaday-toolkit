import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export function withSession<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.message } as any)
    }
  }
} 