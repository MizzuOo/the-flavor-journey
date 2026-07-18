/* ================= PLACE ORDER ================= */
async function placeOrder(user, cart, form, file) {

  if (!user?.id) throw new Error("User not found");

  const total = cart.reduce((sum, i) =>
    sum + Number(i.price) * Number(i.quantity), 0
  );

  // ================= UPLOAD PROOF =================
  let paymentProofUrl = null;

  if (file) {
    paymentProofUrl = await uploadPaymentProof(file, user.id);
  }

  // ================= CREATE ORDER =================
  // ================= CREATE ORDER =================
  const { data: order, error } = await db
    .from("orders")
    .insert([{
      user_id: user.id,
      total,
      payment_method: form.payment,
      payment_proof: paymentProofUrl,
      status: "pending",
      customer_name: form.name,
      phone: form.phone,
      order_type: form.order_type, // Added to map matching schema column
      address: form.address
    }])
    .select()
    .single();

  if (error) throw error;

  // ================= ORDER ITEMS =================
  const orderItems = cart.map(i => ({
    order_id: order.id,
    product_id: i.product_id,
    quantity: Number(i.quantity),
    price: Number(i.price)
  }));

  const { error: itemError } = await db
    .from("order_items")
    .insert(orderItems);

  if (itemError) throw itemError;

  // ================= CLEAR CART =================
  await db
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  return order;
}

/* ================= UPLOAD PAYMENT PROOF ================= */
async function uploadPaymentProof(file, userId) {

  const fileName = `${userId}-${Date.now()}-${file.name}`;

  const { error } = await db
    .storage
    .from("payment-proofs")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = db
    .storage
    .from("payment-proofs")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* ================= ORDER SUMMARY ================= */
function renderOrderSummary(cart) {

  const box = document.getElementById("order-summary");
  const totalEl = document.getElementById("total");

  let total = 0;
  box.innerHTML = "";

  cart.forEach(i => {
    const itemTotal = i.price * i.quantity;
    total += itemTotal;

    box.innerHTML += `
      <div>
        ${i.name} x ${i.quantity} = ${itemTotal.toLocaleString()} MMK
      </div>
    `;
  });

  totalEl.textContent = "Total: " + total.toLocaleString() + " MMK";
}

/* ================= EXPORT ================= */
window.placeOrder = placeOrder;
window.uploadPaymentProof = uploadPaymentProof;
window.renderOrderSummary = renderOrderSummary;