const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY is not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function processQueue() {
  console.log('🔄 Processing analysis queue...');
  
  try {
    // Вызываем Edge Function для обработки очереди
    const { data, error } = await supabase.functions.invoke('process-queue', {
      body: {}
    });

    if (error) {
      console.error('❌ Error processing queue:', error);
      return;
    }

    console.log('✅ Queue processing result:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Queue processing failed:', error.message);
  }
}

// Запускаем обработку каждые 30 секунд
console.log('🚀 Starting queue processor...');
console.log('📋 Processing queue every 30 seconds...');
console.log('⏹️  Press Ctrl+C to stop');

processQueue(); // Первый запуск

setInterval(processQueue, 30000); // Каждые 30 секунд
