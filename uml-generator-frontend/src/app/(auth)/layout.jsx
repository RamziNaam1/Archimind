import Navbar from '@/components/landing/Navbar'

export default function AuthLayout({ children }) {
  return (
    <>
      <Navbar hideActions />
      {children}
    </>
  )
}