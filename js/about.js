// ✅ Supabase Client ကို သုံးပြီး Review အသစ်သိမ်းဆည်းရန်
async function submitFeedback() {
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");

    if (!nameInput || !messageInput) return;

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) {
        alert("Please fill all fields");
        return;
    }

    try {
        // 1️⃣ လက်ရှိ Login ဝင်ထားတဲ့ User အချက်အလက်ကို ရယူခြင်း
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // အကောင့် Login မဝင်ထားရင် Review ပေးခွင့်မပြုဘဲ ပိတ်မည်
        if (authError || !user) {
            alert("Please login first to submit a review!");
            return;
        }

        // 2️⃣ Insert လုပ်တဲ့နေရာမှာ user_id ကိုပါ တွဲထည့်ပေးလိုက်ခြင်း
        const { error } = await supabase
            .from('reviews')
            .insert([
                { 
                    name: name, 
                    message: message,
                    user_id: user.id 
                }
            ]);

        if (error) throw error;

        // အောင်မြင်ရင် Input box တွေကို ရှင်းမယ်
        nameInput.value = "";
        messageInput.value = "";

        // HTML စာမျက်နှာထဲက loadReviews() ကို ပြန်ခေါ်ပြီး list ကို update လုပ်မယ်
        if (typeof loadReviews === "function") {
            loadReviews();
        }
        
        alert("Thank you for your feedback!");

    } catch (error) {
        console.error("Error inserting review:", error.message);
        alert("Review cannot submit. Please Try Again!");
    }
}