import { AppLayout } from '@/components/AppLayout'
import dynamic from 'next/dynamic'

const GBML2Winners = dynamic(() => import('../components/GBML2Winners'), {
  ssr: false,
})

const GBML2WinnersPage = () => {
  return <GBML2Winners />
}

GBML2WinnersPage.Layout = AppLayout
export default GBML2WinnersPage
