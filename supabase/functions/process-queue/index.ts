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
    // Создаем Supabase клиент
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔄 Processing analysis queue...')

    // 1. Получаем задачи из очереди
    const { data: queueItems, error: queueError } = await supabase
      .from('llm_analysis_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (queueError) {
      console.error('❌ Error getting queue items:', queueError)
      return new Response(
        JSON.stringify({ error: 'Failed to get queue items', details: queueError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending items in queue' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📋 Found ${queueItems.length} pending items`)

    // 2. Обрабатываем каждую задачу
    const results = []
    
    for (const item of queueItems) {
      try {
        console.log(`🔄 Processing msg_id: ${item.msg_id}`)
        
        // Обновляем статус на "processing"
        await supabase
          .from('llm_analysis_queue')
          .update({ status: 'processing' })
          .eq('id', item.id)

        // Получаем данные через view
        const { data: promptData, error: promptError } = await supabase
          .from('v_llm_msg_prompt')
          .select('*')
          .eq('msg_id', item.msg_id)
          .single()

        if (promptError || !promptData) {
          throw new Error(`Prompt data not found: ${promptError?.message}`)
        }

        // Отправляем на LLM Bot
        const llmBotUrl = Deno.env.get('LLM_BOT_URL') || 'http://host.docker.internal:3001/analyze'
        console.log(`🤖 Sending to LLM Bot: ${llmBotUrl}`)
        
        // Формируем данные для LLM Bot
        const requestParams = {
          message: {
            id: promptData.msg_id,
            text: promptData.message_text,
            context: promptData.message_context,
            created_at: promptData.message_created_at
          },
          company: {
            title: promptData.brand_title,
            tags: promptData.array_company_tags
          },
          faq_sources: promptData.array_fqa_sources,
          ticket_types: promptData.array_msg_ticket_types,
          raw_data: {
            msg_id: promptData.msg_id,
            message_text: promptData.message_text,
            message_context: promptData.message_context,
            brand_title: promptData.brand_title,
            source_url: promptData.source_url,
            source_title: promptData.source_title,
            source_type_title: promptData.source_type_title,
            array_fqa_sources: promptData.array_fqa_sources,
            array_company_tags: promptData.array_company_tags,
            array_msg_ticket_types: promptData.array_msg_ticket_types,
            message_created_at: promptData.message_created_at
          }
        }

        const analysisResponse = await fetch(llmBotUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msg_id: item.msg_id,
            system_prompt: promptData.system_prompt,
            request_params: requestParams
          })
        })

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json()
          throw new Error(`LLM analysis failed: ${errorData.error}`)
        }

        const analysisResult = await analysisResponse.json()
        console.log(`✅ Analysis completed for msg_id: ${item.msg_id}`)

        // Обновляем статус на "completed"
        await supabase
          .from('llm_analysis_queue')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id)

        results.push({
          id: item.id,
          msg_id: item.msg_id,
          status: 'completed',
          analysis: analysisResult.analysis
        })

      } catch (error) {
        console.error(`❌ Error processing msg_id ${item.msg_id}:`, error.message)
        
        // Обновляем статус на "failed"
        await supabase
          .from('llm_analysis_queue')
          .update({ 
            status: 'failed',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id)

        results.push({
          id: item.id,
          msg_id: item.msg_id,
          status: 'failed',
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Queue processor error:', error)
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
