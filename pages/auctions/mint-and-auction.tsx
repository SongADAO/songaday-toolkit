import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const MintAndAuction = dynamic(
  () => import('../../components/MintAndAuction'),
  {
    ssr: false,
  }
)

const MintAndAuctionPage = () => {
  return <MintAndAuction />
}

MintAndAuctionPage.Layout = AppLayout
export default MintAndAuctionPage
