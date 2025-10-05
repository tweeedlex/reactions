const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY is not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutoAnalysis() {
  console.log('🧪 Testing Auto Analysis System...\n');

  try {
    // 1. Проверяем, что триггер существует
    console.log('1️⃣ Checking trigger...');
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('trigger_name', 'llm_analysis_trigger');

    if (triggerError) {
      console.log('❌ Error checking trigger:', triggerError.message);
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger exists:', triggers[0]);
    } else {
      console.log('❌ Trigger not found');
    }

    // 2. Проверяем функцию анализа
    console.log('\n2️⃣ Testing analysis function...');
    const { data: analysisResult, error: analysisError } = await supabase
      .rpc('analyze_message_manually', { p_msg_id: 2 });

    if (analysisError) {
      console.log('❌ Analysis function error:', analysisError.message);
    } else {
      console.log('✅ Analysis function result:', analysisResult);
    }

    // 3. Проверяем последние анализы
    console.log('\n3️⃣ Checking recent analyses...');
    const { data: recentAnalyses, error: recentError } = await supabase
      .from('ai_msg_analyze')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentError) {
      console.log('❌ Error getting recent analyses:', recentError.message);
    } else {
      console.log('✅ Recent analyses:', recentAnalyses?.length || 0, 'found');
      if (recentAnalyses && recentAnalyses.length > 0) {
        console.log('Latest analysis:', {
          id: recentAnalyses[0].id,
          msg_id: recentAnalyses[0].msg_id,
          theme_text: recentAnalyses[0].theme_text,
          created_at: recentAnalyses[0].created_at
        });
      }
    }

    console.log('\n🎉 Auto Analysis System test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAutoAnalysis();
