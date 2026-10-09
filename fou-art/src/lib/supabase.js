import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wfurylhydwhpjtrozcjw.supabase.co/"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdXJ5bGh5ZHdocGp0cm96Y2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDAzNzYsImV4cCI6MjEwMjcxNjM3Nn0.6U-wLcGCo60mr754t6dgeyqoJCUONOAUCL6747jjvWk"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)