const getSupabaseConfig = () => {
  const config = window.MEMARS_SUPABASE_CONFIG;

  if (!config?.url || !config?.anonKey || config.url.includes("your-project-ref")) {
    console.warn("Supabase is not configured. Update lib/supabase-config.js with your project URL and anon key.");
    return null;
  }

  return config;
};

const createMemarsSupabaseClient = () => {
  const config = getSupabaseConfig();

  if (!config || !window.supabase?.createClient) {
    return null;
  }

  return window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

window.memarsSupabase = createMemarsSupabaseClient();
