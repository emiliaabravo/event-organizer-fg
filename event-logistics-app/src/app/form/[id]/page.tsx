// app/form/[id]/page.tsx (Server Component)
import SignUpForm from './SignUpForm' // client child

export default function FormPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Signup</h1>
      <SignUpForm />
    </div>
  )
}   