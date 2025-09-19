// app/team/[id]/page.tsx (Server Component)
import TeamView from './TeamView'

export default async function TeamViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return <TeamView eventId={id} />
}