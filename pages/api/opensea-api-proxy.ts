import withSession from '@/utils/withSession'
export default withSession<any>(async (req, res) => {
  if (req.method === 'GET') {
    const response = await fetch(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.query.url
    )
    const results = await response.json()

    return res.status(200).json(results)
  } else {
    return res.status(404).json({ success: false })
  }
})
