import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const CreateAuctionGBML2Base = dynamic(
  () => import('../../components/CreateAuctionGBML2Base'),
  {
    ssr: false,
  }
)

const CreateAuctionGBML2BasePage = () => {
  return <CreateAuctionGBML2Base />
}

CreateAuctionGBML2BasePage.Layout = AppLayout
export default CreateAuctionGBML2BasePage
