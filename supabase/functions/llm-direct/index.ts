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

    console.log(`🔄 Processing direct LLM analysis for msg_id: ${msg_id}`)

    // Создаем Supabase клиент
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Получаем данные сообщения и системный промпт
    const { data: messageData, error: messageError } = await supabase
      .from('v_llm_msg_prompt')
      .select('*')
      .eq('msg_id', msg_id)
      .single()

    if (messageError || !messageData) {
      console.error('❌ Message not found:', messageError?.message)
      return new Response(
        JSON.stringify({ error: 'Message not found', details: messageError?.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Message data retrieved')

    // 2. Прямой вызов OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🤖 Calling OpenAI directly...')
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: messageData.system_prompt 
          },
          { 
            role: 'user', 
            content: messageData.message_text 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('❌ OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API failed', 
          details: errorData.error?.message || 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiResult = await openaiResponse.json()
    console.log('✅ OpenAI analysis completed')

    // 3. Парсим JSON ответ от OpenAI
    let analysis
    try {
      analysis = JSON.parse(openaiResult.choices[0].message.content)
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response', 
          details: 'AI returned invalid JSON'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 4. Сохраняем результат в Supabase
    console.log('💾 Saving analysis to database...')
    const { data: saveResult, error: saveError } = await supabase.rpc('save_llm_analysis', {
      p_msg_id: msg_id,
      p_msg_ticket_type_id: analysis.msg_ticket_type_id || null,
      p_theme_text: analysis.theme_text || null,
      p_ton_of_voice_value: analysis.ton_of_voice_value || null,
      p_tags_array: analysis.tags_array || null,
      p_answer_text: analysis.answer_text || null,
      p_company_answer_data_source_id: analysis.company_answer_data_source_id || null
    })

    if (saveError) {
      console.error('❌ Save error:', saveError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save analysis', 
          details: saveError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Analysis saved with ID: ${saveResult}`)

    return new Response(
      JSON.stringify({
        success: true,
        message_id: msg_id,
        analysis_id: saveResult,
        analysis: analysis,
        processing_time_ms: Date.now() - Date.now(), // Можно добавить точное время
        provider: 'openai',
        method: 'direct_edge_function'
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
