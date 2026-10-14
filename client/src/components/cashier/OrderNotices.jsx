function StockNotice({ notice }) {
  if (notice.messages.length === 0) {
    return null;
  }
  return (
    <div className="order-notice" role="status">
      <ul>
        {notice.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <button type="button" className="text-button" onClick={notice.dismiss}>
        Mengerti
      </button>
    </div>
  );
}

function PaymentNotice({ cart }) {
  if (cart.resetting) {
    return (
      <p className="order-notice" role="status">
        Reset sedang diproses. Tunggu sebelum membuat pesanan baru.
      </p>
    );
  }
  return cart.checkout.status === 'uncertain' ? (
    <p className="order-notice order-notice--warning" role="status">
      Pembayaran terakhir belum pasti tersimpan. Pesanan dikunci sampai dikirim ulang atau
      dibatalkan.
    </p>
  ) : null;
}

// Pesan stok, pembayaran tertunda, dan reset mengikuti kondisi keranjang.
export function OrderNotices({ page }) {
  return (
    <>
      <StockNotice notice={page.stockNotice} />
      <PaymentNotice cart={page.cart} />
    </>
  );
}
