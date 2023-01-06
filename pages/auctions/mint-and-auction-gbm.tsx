import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const MintAndAuctionGBM = dynamic(
  () => import('../../components/MintAndAuctionGBM'),
  {
    ssr: false,
  }
)

const MintAndAuctionPage = () => {
  return <MintAndAuctionGBM />
}

MintAndAuctionPage.Layout = AppLayout
export default MintAndAuctionPage
