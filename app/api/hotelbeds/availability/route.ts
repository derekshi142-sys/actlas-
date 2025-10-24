import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-hotelbeds-key')
    const apiSecret = request.headers.get('x-hotelbeds-secret')

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'API credentials required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Generate signature
    const timestamp = Math.floor(Date.now() / 1000)
    const message = apiKey + apiSecret + timestamp
    const signature = crypto.createHash('sha256').update(message).digest('hex')

    const response = await fetch('https://api.test.hotelbeds.com/hotel-api/1.0/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Api-key': apiKey,
        'X-Signature': signature,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `HotelBeds API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

