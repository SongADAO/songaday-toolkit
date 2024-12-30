import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const GBML2ZoraWinners = dynamic(
  () => import('../components/GBML2ZoraWinners'),
  {
    ssr: false,
  }
)

const GBML2ZoraWinnersPage = () => {
  return <GBML2ZoraWinners />
}

GBML2ZoraWinnersPage.Layout = AppLayout
export default GBML2ZoraWinnersPage
