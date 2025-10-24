import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-hotelbeds-key')
    const apiSecret = request.headers.get('x-hotelbeds-secret')

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'API credentials required' },
        { status: 401 }
      )
    }

    // Generate signature
    const timestamp = Math.floor(Date.now() / 1000)
    const message = apiKey + apiSecret + timestamp
    const signature = crypto.createHash('sha256').update(message).digest('hex')

    const response = await fetch('https://api.test.hotelbeds.com/hotel-api/1.0/status', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-key': apiKey,
        'X-Signature': signature,
      },
    })

    const data = await response.json()
    return NextResponse.json({ ok: response.ok, data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

