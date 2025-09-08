import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  // Check admin key
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const eventData = await request.json()
    
    const { data, error } = await supabase
    .from('events')
    .insert({
      title: eventData.title,
      date: eventData.date,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      setup_time: eventData.setup_time,
      venue: eventData.venue,
      address: eventData.address,
      company_contact: eventData.company_contact,
      capacity: eventData.capacity,
      description: eventData.description,
      status: eventData.status,
      coordinator_email: 'emiliaabravo19@gmail.com' // MY email id
    })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}