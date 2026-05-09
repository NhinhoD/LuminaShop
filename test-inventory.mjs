import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js'; 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey); 
async function test() { 
  const { data, error } = await supabase.from('inventory_items').select('*').eq('product_id', 'c12b3cef-9d52-40a2-aaeb-b3a459951b75').is('variant_id', null).single(); 
  console.log('Base:', data, error); 
} 
test();
