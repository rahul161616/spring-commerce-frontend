import CompactCollection, { CompactTable, CompactTableHeader } from '../components/shared/CompactCollection';
import SummaryCard from '../components/shared/SummaryCard';

function formatCurrency(amount, currencyCode) {
  return `${currencyCode || 'NRS'} ${Number(amount || 0).toFixed(2)}`;
}

function OrdersView({
  isLoadingOrders,
  onRefreshOrders,
  onViewOrder,
  orders,
  orderSummary,
}) {
  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Total Orders" value={orderSummary.totalOrders} tone="default" />
        <SummaryCard label="Pending Payment" value={orderSummary.pendingPayment} tone="warning" />
        <SummaryCard label="Submitted Proof" value={orderSummary.paymentSubmitted} tone="accent" />
        <SummaryCard label="Verified Payments" value={orderSummary.paymentVerified} tone="default" />
      </section>

      <CompactCollection
        addLabel="Refresh Orders"
        countLabel={`${orders.length} records`}
        emptyLabel="No orders have been placed yet."
        hasItems={orders.length > 0}
        isLoading={isLoadingOrders}
        loadingLabel="Loading orders..."
        onAdd={onRefreshOrders}
        title="Order Ledger"
      >
        <CompactTable>
          <CompactTableHeader columns={['Order', 'Name', 'Status', 'Total', 'Remarks', 'Actions']} />
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className="compact-primary">
                    <strong>{order.orderCode}</strong>
                    <span>#{order.id}</span>
                  </div>
                </td>
                <td>
                  <div className="compact-primary">
                    <strong>{order.customerName || '--'}</strong>
                  </div>
                </td>
                <td className="compact-state-cell">
                  <div className="state-pill-wrap">
                    <span className={`status-pill ${order.status === 'PAYMENT_VERIFIED' || order.status === 'COMPLETED' ? 'success' : order.status === 'PAYMENT_REJECTED' || order.status === 'CANCELLED' ? 'danger' : 'warning'}`}>
                      {order.status}
                    </span>
                  </div>
                </td>
                <td className="compact-mono">{formatCurrency(order.grandTotalAmount, order.currencyCode)}</td>
                <td className="compact-description-cell">{order.paymentRemarks || 'No remarks'}</td>
                <td className="compact-actions-cell">
                  <button type="button" className="table-action" onClick={() => onViewOrder(order)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </CompactTable>
      </CompactCollection>
    </>
  );
}

export default OrdersView;
