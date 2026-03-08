import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://psoasfqzcbpqjgatcgfh.supabase.co"
const supabaseKey = "sb_publishable_lMBtPwTG_Sfxe02WByNabw_rx5Olqto"

export const supabase = createClient(supabaseUrl, supabaseKey)