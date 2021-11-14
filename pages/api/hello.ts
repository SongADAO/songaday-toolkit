import withSession from '@/utils/withSession'

export default withSession<{ name: string }>((req, res) => {
  res.status(200).json({ name: 'John Doe' })
})
