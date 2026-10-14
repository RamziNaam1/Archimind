import AuthForm from '@/components/auth/AuthForm'

export const metadata = {
  title: 'Login — Archimind',
}

export default function LoginPage() {
  return <AuthForm defaultMode="login" />
}