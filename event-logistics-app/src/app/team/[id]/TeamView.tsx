'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  date: string
  venue: string
  start_time?: string
  end_time?: string
}

interface Participant {
  id: string
  full_name: string
  email: string
  phone_number: string
  event_id: string
  signup_time: string
}

interface TeamViewProps {
  eventId: string
}

export default function TeamView({ eventId }: TeamViewProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [raffleWinners, setRaffleWinners] = useState<Participant[]>([])
  const [showRaffle, setShowRaffle] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEventData()
    fetchParticipants()
  }, [eventId])

  const fetchEventData = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const events = await response.json()
        const currentEvent = events.find((e: Event) => e.id === eventId)
        setEvent(currentEvent || null)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      console.log('🔍 Fetching participants for eventId:', eventId)
      const response = await fetch(`/api/participants?eventId=${eventId}`)
      console.log('�� Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Participants data received:', data)
        setParticipants(data)
      } else {
        console.error('❌ Failed to fetch participants:', response.status)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  const generateQRCode = async () => {
    try {
      const formUrl = `${window.location.origin}/form/${eventId}`
      const qrCodeDataURL = await QRCode.toDataURL(formUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      })
      setQrCodeUrl(qrCodeDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const conductRaffle = () => {
    if (participants.length === 0) return
    
    const availableParticipants = participants.filter(p => 
      !raffleWinners.some(w => w.id === p.id)
    )
    
    if (availableParticipants.length === 0) {
      alert('All participants have already won!')
      return
    }
    
    const randomIndex = Math.floor(Math.random() * availableParticipants.length)
    const winner = availableParticipants[randomIndex]
    
    setRaffleWinners(prev => [...prev, winner])
    setShowRaffle(true)
  }

  const resetRaffle = () => {
    setRaffleWinners([])
    setShowRaffle(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString()} at {event.venue}
                {event.start_time && ` • ${event.start_time}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Event QR Code</h2>
              <button
                onClick={generateQRCode}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Generate QR Code
              </button>
            </div>
            
            {qrCodeUrl ? (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border inline-block mb-4">
                  <Image src={qrCodeUrl} alt="QR Code" width={300} height={300} />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code to register for the event
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.download = `qr-code-${event.title.replace(/\s+/g, '-')}.png`
                      link.href = qrCodeUrl
                      link.click()
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    Download QR Code
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/form/${eventId}`)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Click "Generate QR Code" to create the registration QR code
              </div>
            )}
          </div>

          {/* Participants & Raffle Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Participants ({participants.length})
              </h2>
              <div className="space-x-2">
                <button
                  onClick={conductRaffle}
                  disabled={participants.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                  Make Raffle
                </button>
                {raffleWinners.length > 0 && (
                  <button
                    onClick={resetRaffle}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    Reset Raffle
                  </button>
                )}
              </div>
            </div>

            {/* Raffle Results */}
            {showRaffle && raffleWinners.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Raffle Winners:</h3>
                {raffleWinners.map((winner, index) => (
                  <div key={winner.id} className="text-sm text-yellow-700 mb-1">
                    {index + 1}. {winner.full_name} - {winner.email} - {winner.phone_number}
                  </div>
                ))}
              </div>
            )}

            {/* Participants List */}
            <div className="max-h-96 overflow-y-auto">
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{participant.full_name}</h4>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                          <p className="text-sm text-gray-600">{participant.phone_number}</p>
                        </div>
                        {raffleWinners.some(w => w.id === participant.id) && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Winner!
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No participants yet. Share the QR code to get signups!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}