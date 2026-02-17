import { supabase } from './lib/supabase'

export default function SupabaseTest() {
  const runTest = async () => {
    const { data, error } = await supabase.from('submissions').insert([
      {
        id: crypto.randomUUID(),
        session_id: 'manual-test',
        step_name: 'smoke_test',
        step_type: 'debug',
        freetext_value: 'MANUAL INSERT TEST',
        created_at: new Date().toISOString()
      }
    ])

    console.log('SUPABASE RESULT:', { data, error })
    alert(error ? 'Insert failed ❌' : 'Insert worked ✅')
  }

  return (
    <button
      onClick={runTest}
      style={{
        padding: 12,
        background: 'black',
        color: 'white',
        borderRadius: 8
      }}
    >
      Test Supabase Insert
    </button>
  )
}
