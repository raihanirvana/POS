import { MenuArea } from '../components/cashier/MenuArea.jsx';
import { OrderContainer } from '../components/cashier/OrderContainer.jsx';
import { PaymentDialog } from '../components/cashier/PaymentDialog.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { ReceiptDialog } from '../components/receipt/ReceiptDialog.jsx';
import { useCashierPage } from '../hooks/useCashierPage.js';

export function CashierPage() {
  const page = useCashierPage();
  return (
    <>
      <PageHeader title="Kasir" subtitle="Seduhan yang baik dimulai dari sini.">
        <span className="shift-pill">
          <i aria-hidden="true" />
          Kedai siap melayani
        </span>
      </PageHeader>
      <div className="pos-layout">
        <MenuArea page={page} />
        <OrderContainer page={page} />
      </div>
      {page.payment.open ? <PaymentDialog page={page} /> : null}
      {page.payment.receipt ? (
        <ReceiptDialog
          receipt={page.payment.receipt}
          onClose={page.payment.closeReceipt}
        />
      ) : null}
    </>
  );
}
