import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://PROJECT_ID_KAMU.supabase.co'
const supabaseKey = 'ANON_KEY_KAMU'

export const supabase = createClient(supabaseUrl, supabaseKey)