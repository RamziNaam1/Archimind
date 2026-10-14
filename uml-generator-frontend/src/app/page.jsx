import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import SocialProof from '@/components/landing/SocialProof'
import Features from '@/components/landing/Features'
import Footer from '@/components/landing/Footer'
import EditorTeaser from '@/components/landing/EditorTeaser'
 


export default function HomePage() {
  return (
    <>
    <Navbar />
    <Hero />
    <SocialProof />
    <EditorTeaser />
    <Features />
    <Footer />
    </>
  )
}