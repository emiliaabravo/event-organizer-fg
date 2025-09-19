import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple time converter
const convertToTimeFormat = (timeStr: string): string | null => {
  if (!timeStr || timeStr.trim() === '') return null
  
  const time = timeStr.trim().toLowerCase()
  
  // Handle formats like "6pm", "6 pm", "6:00pm"
  const pmMatch = time.match(/(\d{1,2}):?(\d{0,2})\s*pm/)
  if (pmMatch) {
    let hours = parseInt(pmMatch[1])
    const minutes = pmMatch[2] || '00'
    if (hours !== 12) hours += 12
    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }
  
  // Handle formats like "6am", "6 am", "6:00am"
  const amMatch = time.match(/(\d{1,2}):?(\d{0,2})\s*am/)
  if (amMatch) {
    let hours = parseInt(amMatch[1])
    const minutes = amMatch[2] || '00'
    if (hours === 12) hours = 0
    return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }
  
  // Handle 24-hour format like "18:30"
  if (/^\d{1,2}:\d{2}$/.test(time)) {
    return time
  }
  
  // If we can't parse it, return null
  return null
}

export async function POST(request: NextRequest) {
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
        start_time: convertToTimeFormat(eventData.start_time),
        end_time: convertToTimeFormat(eventData.end_time),
        setup_time: convertToTimeFormat(eventData.setup_time),
        venue: eventData.venue,
        address: eventData.address || null,
        company_contact: eventData.company_contact || null,
        capacity: eventData.capacity || null,
        description: eventData.description || null,
        status: eventData.status,
        coordinator_email: 'emiliaabravo19@gmail.com'
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ API Error:', error)
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