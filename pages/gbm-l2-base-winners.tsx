import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const GBML2BaseWinnersProvider = dynamic(
  () => import('../components/GBML2BaseWinnersProvider'),
  {
    ssr: false,
  }
)

const GBML2BaseWinnersPage = () => {
  return <GBML2BaseWinnersProvider />
}

GBML2BaseWinnersPage.Layout = AppLayout
export default GBML2BaseWinnersPage
