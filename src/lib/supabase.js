import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://kuayzbygcqwbkxrbleto.supabase.co'
const SUPABASE_ANON = 'sb_publishable_xC-OFQlrfx-KJ2yIwXW57Q_Aie28Hlu'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)