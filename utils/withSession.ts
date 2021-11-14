// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

type NextApiHandlerWithSession<T> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => void | Promise<void>

function errorHandler(err: any, res: NextApiResponse) {
  return res.status(err.status).json(err.response)
}

const apiHandler = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // route handler
      await handler(req, res)
    } catch (err) {
      // global error handler
      errorHandler(err, res)
    }
  }
}

export default function withSession<T>(handler: NextApiHandlerWithSession<T>) {
  return apiHandler(handler as NextApiHandler)
}
