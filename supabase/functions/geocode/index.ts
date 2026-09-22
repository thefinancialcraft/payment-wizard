import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers))

    let address, podFilter, access_token

    // Try to parse from body first
    try {
      const body = await req.json()
      console.log('Request body:', body)
      address = body.address
      podFilter = body.podFilter || 'pincode'
      access_token = body.access_token
    } catch (e) {
      console.log('Failed to parse body, trying query params')
      // Fallback to query params
      const url = new URL(req.url)
      address = url.searchParams.get('address')
      podFilter = url.searchParams.get('podFilter') || 'pincode'
      access_token = url.searchParams.get('access_token')
    }

    console.log('Parameters:', { address, podFilter, access_token })

    if (!address || !access_token) {
      console.error('Missing required parameters')
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', received: { address, podFilter, access_token } }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const mapplsUrl = `https://search.mappls.com/search/address/geocode?address=${encodeURIComponent(address)}&podFilter=${podFilter}&access_token=${access_token}`
    console.log('Mappls URL:', mapplsUrl)

    const response = await fetch(mapplsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('Mappls response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mappls API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Mappls API request failed', status: response.status, details: errorText }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    console.log('Mappls response data:', data)

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Geocode error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
