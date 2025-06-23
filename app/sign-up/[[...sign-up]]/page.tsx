import { SignUp } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký - WebPhim',
}

export default function SignUpPage() {
  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      {/* Clerk prebuilt SignUp component with Google, Facebook, SMS */}
      <SignUp afterSignUpUrl="/" appearance={{ elements: { card: 'shadow-lg' } }} />
    </main>
  )
}
