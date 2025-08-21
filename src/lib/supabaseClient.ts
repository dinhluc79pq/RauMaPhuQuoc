import { createClient } from "@supabase/supabase-js"

// Khai báo type cho supabase client
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
