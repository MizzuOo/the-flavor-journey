// 💡 window.supabase သို့မဟုတ် window.db ကြိုက်တာရှိရင် ယူသုံးမယ်
const db = window.supabase || window.db; 

/* ================= GET USER ================= */
async function getUser() {
  const activeDb = window.supabase || window.db;
  if (!activeDb) return null;
  const { data, error } = await activeDb.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

/* ================= GET PROFILE ================= */
async function getProfile(userId) {
  const activeDb = window.supabase || window.db;
  if (!activeDb) return null;
  const { data, error } = await activeDb
    .from("profiles")
    .select("role, email")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

/* ================= REQUIRE AUTH ================= */
async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = "../login.html";
    return null;
  }
  return user;
}

/* ================= REQUIRE ADMIN ================= */
async function requireAdmin() {
    const { data: { session } } = await db.auth.getSession();
    
    // Login မဝင်ထားရင် Login Page သို့ မောင်းထုတ်မည်
    if (!session) {
        window.location.href = "../user/login.html"; // မိမိ Login Page လမ်းကြောင်းအတိုင်း ပြင်ပါ
        return null;
    }
    
    // Profiles Table ထဲမှာ Role ကို စစ်ဆေးမည်
    const { data: profile } = await db
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
    // Admin မဟုတ်ရင် User ဘက်သို့ ပြန်မောင်းထုတ်မည်
    if (!profile || profile.role !== "admin") {
        alert("Access Denied! Admins Only.");
        window.location.href = "../user/index.html"; 
        return null;
    }
    
    return profile;
}

/* ================= LOGIN ================= */
async function loginUser(email, password) {
  const activeDb = window.supabase || window.db;
  if (!activeDb) return { success: false, message: "Database not initialized" };
  const { data, error } = await activeDb.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: error.message };
  return { success: true, user: data.user };
}

/* ================= REGISTER ================= */

async function registerUser(email, password) {
  const activeDb = window.supabase || window.db;
  if (!activeDb) return { success: false, message: "Database not initialized", isExisting: false };

  const { data: existingProfile, error: profileError } = await activeDb
    .from("profiles")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    return {
      success: false,
      message: profileError.message || "Profile lookup failed.",
      isExisting: false,
    };
  }

  if (existingProfile) {
    return {
      success: false,
      message: "This email is already registered.",
      isExisting: true,
    };
  }

  const { data, error } = await activeDb.auth.signUp({
    email,
    password,
  });

  console.log("registerUser result:", { email, existingProfile, data, error });

  if (error) {
    const rawMessage = (error.message || "").toLowerCase();
    const isExisting = /already registered|user already registered|already exists|duplicate|unique constraint/.test(rawMessage);
    return {
      success: false,
      message: isExisting ? "This email is already registered." : error.message || "Registration failed.",
      isExisting,
    };
  }

  const sessionIsNull = data?.session == null;
  const user = data?.user || null;
  const confirmedEmail = user?.email_confirmed_at || user?.confirmed_at || user?.email_confirmed;
  const createdAt = user?.created_at ? Date.parse(user.created_at) : null;
  const isOldAccount = createdAt ? Date.now() - createdAt > 2 * 60 * 1000 : false;
  const hasUserButNoSession = !!user && sessionIsNull;

  if (sessionIsNull && (!user || confirmedEmail || isOldAccount || hasUserButNoSession)) {
    return {
      success: false,
      message: "This email is already registered.",
      isExisting: true,
    };
  }

  return {
    success: true,
    user,
    message: "Registration successful.",
    isExisting: false,
  };
}









/* ================= LOGOUT ================= */
async function logout() {
    try {
        const activeDb = window.supabase || window.db;
        if (activeDb) await activeDb.auth.signOut();
        
        // အားလုံးကို ရှင်းပစ်ပါ
        localStorage.clear();
        sessionStorage.clear();
        
        // Browser Cache ကို ကျော်ပြီး index.html ကို ပြန်သွားပါ
        window.location.href = "../user/index.html"; 
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

/* ================= CHECK AUTH ================= */
async function checkAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = "../user/login.html";
    return false;
  }
  return true;
}

/* ================= EXPORT ================= */
window.getUser = getUser;
window.getProfile = getProfile;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logout = logout; 
window.checkAuth = checkAuth;