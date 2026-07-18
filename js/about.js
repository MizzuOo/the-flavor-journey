// Supabase Client ကို သုံးပြီး Review အသစ်သိမ်းဆည်းရန်
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
        // 1️⃣ အရင်ဦးဆုံး လက်ရှိ Login ဝင်ထားတဲ့ User အချက်အလက်ကို ရယူခြင်း
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // အကယ်၍ အကောင့် Login မဝင်ထားရင် Review ပေးခွင့်မပြုဘဲ ပိတ်မည်
        if (authError || !user) {
            alert("Please login first to submit a review!");
            return;
        }

        // 2️⃣ Insert လုပ်တဲ့နေရာမှာ user_id: user.id ကိုပါ တွဲထည့်ပေးလိုက်ခြင်း
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                { 
                    name: name, 
                    message: message,
                    user_id: user.id // 👈 ဒါလေး ထပ်တိုးထည့်ပေးလိုက်တာဖြစ်လို့ null value error မတက်တော့ပါဘူး
                }
            ]);

        if (error) throw error;

        // အောင်မြင်ရင် Input box တွေကို ရှင်းမယ်
        nameInput.value = "";
        messageInput.value = "";

        // Review List ကို Update ပြန်လုပ်မယ်
        loadReviews();
        alert("Thank you for your feedback!");

    } catch (error) {
        console.error("Error inserting review:", error.message);
        alert("Review cannot submit. Please Try Again!");
    }
}

// Supabase ထဲက Review တွေကို ဆွဲထုတ်ပြီး ပြသရန်
async function loadReviews() {
    const reviewList = document.getElementById("reviewList");
    if (!reviewList) return;

    try {
        // Database ထဲကနေ နောက်ဆုံးပေးထားတဲ့ review တွေကို အရင်ဆုံးရအောင် ဆွဲထုတ်မယ်
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        let html = "";
        if (reviews && reviews.length > 0) {
            reviews.forEach(r => {
                html += `
                <div class="review-card">
                    <strong>${r.name}</strong>
                    <p>${r.message}</p>
                </div>
                `;
            });
        } else {
            html = "<p style='padding: 10px; color: gray;'>No reviews yet. Be the first to review!</p>";
        }

        reviewList.innerHTML = html;

    } catch (error) {
        console.error("Error loading reviews:", error.message);
        reviewList.innerHTML = "<p style='padding: 10px; color: red;'>Cannot load reviews.</p>";
    }
}