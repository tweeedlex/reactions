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
    const { msg_id } = await req.json()

    if (!msg_id) {
      return new Response(
        JSON.stringify({ error: 'msg_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Создаем Supabase клиент
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`🔄 Processing analysis for msg_id: ${msg_id}`)

    // 1. Получаем данные через get_llm_prompt_by_msg_id
    const { data: promptData, error: promptError } = await supabase
      .rpc('get_llm_prompt_by_msg_id', { msg_id })

    if (promptError || !promptData) {
      console.error('❌ Prompt data not found:', promptError?.message)
      return new Response(
        JSON.stringify({ error: 'Prompt data not found', details: promptError?.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Prompt data retrieved')

    // 2. Отправляем на LLM Bot для анализа
    // Получаем URL LLM Bot из переменных окружения или используем значение по умолчанию
    const llmBotUrl = Deno.env.get('LLM_BOT_URL') || 'http://host.docker.internal:3001/analyze'
    console.log(`🤖 Sending to LLM Bot: ${llmBotUrl}`)
    
    const analysisResponse = await fetch(llmBotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msg_id: msg_id,
        system_prompt: promptData.system_prompt,
        request_params: promptData.request_params
      })
    })

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json()
      console.error('❌ LLM analysis failed:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'LLM analysis failed', 
          details: errorData.error 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const analysisResult = await analysisResponse.json()
    console.log('✅ LLM analysis completed')

    // 3. Результат уже сохранен в public.ai_msg_analyze через save_llm_analysis
    console.log(`💾 Analysis completed for msg_id: ${msg_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message_id: msg_id,
        analysis: analysisResult.analysis,
        flow: {
          step1: 'Prompt data retrieved via get_llm_prompt_by_msg_id',
          step2: 'Sent to LLM Bot for AI processing',
          step3: 'Results saved to public.ai_msg_analyze via save_llm_analysis'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})