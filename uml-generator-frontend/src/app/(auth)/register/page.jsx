import AuthForm from '@/components/auth/AuthForm'

export const metadata = {
  title: 'Register — Archimind',
}

export default function RegisterPage() {
  return <AuthForm defaultMode="register" />
}