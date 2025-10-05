const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Supabase конфигурация
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY is not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI конфигурация
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set!');
  process.exit(1);
}

// Вызов OpenAI GPT-4
async function callOpenAI(systemPrompt, userPrompt) {
  try {
    console.log('Calling OpenAI API...');
    console.log('System prompt length:', systemPrompt.length);
    console.log('User prompt length:', userPrompt.length);
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('OpenAI response received');
    const llmResponse = response.data.choices[0].message.content;
    console.log('LLM response:', llmResponse);
    
    // Очищаем ответ от markdown форматирования
    let cleanResponse = llmResponse.trim();
    
    // Удаляем ```json и ``` если есть
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned response:', cleanResponse);
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('OpenAI API Error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    throw error;
  }
}

// Сохраняем результат в Supabase
async function saveAnalysis(analysisData) {
  const { data, error } = await supabase.rpc('save_llm_analysis', {
    p_answer_text: analysisData.answer_text,
    p_company_answer_data_source_id: analysisData.company_answer_data_source_id,
    p_msg_id: analysisData.msg_id,
    p_msg_ticket_type_id: analysisData.msg_ticket_type_id,
    p_tags_array: analysisData.tags_array,
    p_theme_text: analysisData.theme_text,
    p_ton_of_voice_value: analysisData.ton_of_voice_value
  });
  
  if (error) console.error(error);
  else console.log(data);
  
  return { data, error };
}

// Основной endpoint для анализа
app.post('/analyze', async (req, res) => {
  try {
    const { msg_id, system_prompt, request_params } = req.body;

    if (!msg_id || !system_prompt) {
      return res.status(400).json({
        error: 'Missing required fields: msg_id, system_prompt'
      });
    }

    console.log(`Processing analysis for msg_id: ${msg_id}`);

    // 1. Подготавливаем данные для LLM
    const llmInput = JSON.stringify(request_params, null, 2);
    
    // 2. Вызываем OpenAI GPT-4
    const analysis = await callOpenAI(system_prompt, llmInput);
    console.log('LLM analysis completed');

    // 3. Добавляем msg_id к результату
    analysis.msg_id = msg_id;

    // 4. Сохраняем в Supabase
    await saveAnalysis(analysis);

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 LLM Bot running on http://localhost:${PORT}`);
  console.log(`📋 POST /analyze - Analyze message with LLM`);
  console.log(`🏥 GET /health - Health check`);
});
