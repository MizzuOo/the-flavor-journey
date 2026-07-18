async function renderNavbarUser() {
    const userDisplay = document.getElementById("userDisplay");
    const authItem = document.getElementById("auth-item");

    // Supabase ကနေ Session ကို အသစ်ပြန်ခေါ်စစ်ပါ
    const { data: { session } } = await db.auth.getSession();

    // အကယ်၍ Session မရှိတော့ရင် (Logout ဖြစ်သွားရင်)
    if (!session) {
        if (userDisplay) userDisplay.textContent = ""; // Hi, ... ကို ရှင်းထုတ်မယ်
        if (authItem) {
            authItem.innerHTML = '<a href="login.html" class="nav-link">Login</a>';
        }
        return; // ဒီနေရာမှာ ရပ်လိုက်မယ်
    }

    // Session ရှိနေမှသာ ဒီစာသားတွေ ပေါ်လာမယ်
    if (userDisplay) userDisplay.textContent = `Hi, ${session.user.email}`;
    if (authItem) {
        authItem.innerHTML = '<a href="#" class="nav-link" onclick="handleLogout(event)">Logout</a>';
    }
}
// ⚠️ ဒီ Logout Function ကို ui.js အောက်ခြေမှာ သေချာထည့်ပေးပါ
async function handleLogout(event) {
  if (event) event.preventDefault(); // # ကြောင့် Page အပေါ်ဆုံးကို ခုန်မတက်သွားအောင် တားဆီးခြင်း
  
  try {
    // Supabase Session ကို Browser ထဲကနေ တရားဝင် အပြီးတိုင် ဖျက်ချလိုက်ခြင်း
    await db.auth.signOut();
    
    // ပိုသေချာအောင် Navbar ကို ချက်ချင်း Reset လုပ်ခိုင်းခြင်း
    renderNavbarUser(); 
    
    // လိုအပ်ပါက အဓိက user/index.html သို့ Page ပြန်ဖွင့်ခိုင်းခြင်း
    window.location.reload(); 
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
}

// HTML ထဲက ကောက်ခေါ်နိုင်အောင် Global Window Object ထဲ ထည့်ပေးခြင်း
window.handleLogout = handleLogout;

// Auth State ကို စောင့်ကြည့်ခြင်း
db.auth.onAuthStateChange((event, session) => {
  renderNavbarUser();
});