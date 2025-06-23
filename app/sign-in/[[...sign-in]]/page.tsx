import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng nhập - WebPhim',
}

export default function SignInPage() {
  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      {/* Clerk prebuilt SignIn component; social (Google, Facebook) & SMS providers enabled in Clerk dashboard */}
      <SignIn afterSignInUrl="/" appearance={{ elements: { card: 'shadow-lg' } }} />
    </main>
  )
}
