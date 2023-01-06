import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const CreateAuctionGBM = dynamic(
  () => import('../../components/CreateAuctionGBM'),
  {
    ssr: false,
  }
)

const CreateAuctionGBMPage = () => {
  return <CreateAuctionGBM />
}

CreateAuctionGBMPage.Layout = AppLayout
export default CreateAuctionGBMPage
