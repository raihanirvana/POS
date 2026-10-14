import { useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useModalDialog } from '../../hooks/useModalDialog.js';
import { formatRupiah } from '../../lib/format.js';
import { Icon } from '../Icon.jsx';
import { OrderPanel } from './OrderPanel.jsx';

function MobileOrderBar({ page, onOpen }) {
  const count = page.cart.order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <button type="button" className="mobile-order-bar" onClick={onOpen}>
      <span>
        <Icon name="receipt" size={18} />
        Lihat pesanan ({count})
      </span>
      <strong>{formatRupiah(page.preview.total)}</strong>
    </button>
  );
}

// Di ponsel panel pesanan dibuka sebagai dialog modal (fokus terkunci, Escape menutup).
function OrderSheet({ page, onClose }) {
  const dialogRef = useModalDialog(true);
  const openPayment = () => {
    onClose();
    page.payment.openPayment();
  };
  const sheetPage = { ...page, payment: { ...page.payment, openPayment } };
  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }
  return (
    <dialog
      ref={dialogRef}
      className="order-sheet"
      onCancel={handleCancel}
      aria-labelledby="order-title"
    >
      <OrderPanel page={sheetPage} onClose={onClose} />
    </dialog>
  );
}

export function OrderContainer({ page }) {
  const mobile = useMediaQuery('(max-width: 720px)');
  const [open, setOpen] = useState(false);
  if (!mobile) {
    return (
      <aside className="order-panel" aria-labelledby="order-title">
        <OrderPanel page={page} />
      </aside>
    );
  }
  return (
    <>
      <MobileOrderBar page={page} onOpen={() => setOpen(true)} />
      {open ? <OrderSheet page={page} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
