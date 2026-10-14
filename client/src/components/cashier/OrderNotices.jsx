// Penjelasan saat pesanan disesuaikan dengan stok, atau pembayaran belum pasti.
export function OrderNotices({ page }) {
  const { stockNotice, cart } = page;
  return (
    <>
      {stockNotice.messages.length > 0 ? (
        <div className="order-notice" role="status">
          <ul>
            {stockNotice.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <button type="button" className="text-button" onClick={stockNotice.dismiss}>
            Mengerti
          </button>
        </div>
      ) : null}
      {cart.checkout.status === 'uncertain' ? (
        <p className="order-notice order-notice--warning" role="status">
          Pembayaran terakhir belum pasti tersimpan. Pesanan dikunci sampai dikirim ulang
          atau dibatalkan.
        </p>
      ) : null}
    </>
  );
}
