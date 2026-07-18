const SUPABASE_URL = "https://vqodfhrfujpyghvhxode.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb2RmaHJmdWpweWdodmh4b2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NTkxNjgsImV4cCI6MjA5MjIzNTE2OH0.i6kCYFwvT9W7UpKveo-XymoUFF7r_n8jH-3yXrNsL9Y";

// 💡 CDN loading အဆင်ပြေမပြေ ကြိုတင်စစ်ဆေးခြင်း
if (typeof supabase !== 'undefined') {
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: sessionStorage, 
      persistSession: true
    }
  });
  
  window.supabase = client;
  window.db = client;
  console.log("✅ Supabase ready with sessionStorage");
} else {
  console.error("❌ Supabase library failed to load from CDN.");
}

if (window.initDB) {
  window.initDB();
}