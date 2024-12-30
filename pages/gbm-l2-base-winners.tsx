import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const GBML2BaseWinners = dynamic(
  () => import('../components/GBML2BaseWinners'),
  {
    ssr: false,
  }
)

const GBML2BaseWinnersPage = () => {
  return <GBML2BaseWinners />
}

GBML2BaseWinnersPage.Layout = AppLayout
export default GBML2BaseWinnersPage
