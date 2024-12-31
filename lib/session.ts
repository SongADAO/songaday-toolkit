import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

// This is a simple middleware wrapper
// We can expand this later if we need session management
export function withSession(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Add any session validation here if needed
      return await handler(req, res)
    } catch (error) {
      console.error('API Error:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
} 