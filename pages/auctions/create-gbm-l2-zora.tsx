import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const CreateAuctionGBML2Zora = dynamic(
  () => import('../../components/CreateAuctionGBML2Zora'),
  {
    ssr: false,
  }
)

const CreateAuctionGBML2ZoraPage = () => {
  return <CreateAuctionGBML2Zora />
}

CreateAuctionGBML2ZoraPage.Layout = AppLayout
export default CreateAuctionGBML2ZoraPage
