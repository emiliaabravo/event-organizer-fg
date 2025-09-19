// app/form/[id]/page.tsx (Server Component)
import SignUpForm from './SignUpForm' // client child

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Signup</h1>
      <SignUpForm eventId={id} />
    </div>
  )
}