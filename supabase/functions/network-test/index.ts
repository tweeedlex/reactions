import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('🧪 Testing network connectivity...')

    // Test 1: Simple HTTP request
    console.log('1️⃣ Testing basic HTTP request...')
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'User-Agent': 'Supabase-Edge-Function'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Basic HTTP request successful:', data.url)
      } else {
        console.log('❌ Basic HTTP request failed:', response.status)
      }
    } catch (error) {
      console.log('❌ Basic HTTP request error:', error.message)
    }

    // Test 2: OpenAI API (without actual call)
    console.log('2️⃣ Testing OpenAI API connectivity...')
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (openaiResponse.ok) {
        const models = await openaiResponse.json()
        console.log('✅ OpenAI API accessible, models count:', models.data?.length || 0)
      } else {
        console.log('❌ OpenAI API failed:', openaiResponse.status, await openaiResponse.text())
      }
    } catch (error) {
      console.log('❌ OpenAI API error:', error.message)
    }

    // Test 3: DNS resolution
    console.log('3️⃣ Testing DNS resolution...')
    try {
      const dnsResponse = await fetch('https://api.openai.com', {
        method: 'HEAD'
      })
      console.log('✅ DNS resolution successful')
    } catch (error) {
      console.log('❌ DNS resolution failed:', error.message)
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Network test completed - check logs for details',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Network test error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
