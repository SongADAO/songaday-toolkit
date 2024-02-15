import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const CreateAuctionGBML2 = dynamic(
  () => import('../../components/CreateAuctionGBML2'),
  {
    ssr: false,
  }
)

const CreateAuctionGBML2Page = () => {
  return <CreateAuctionGBML2 />
}

CreateAuctionGBML2Page.Layout = AppLayout
export default CreateAuctionGBML2Page
