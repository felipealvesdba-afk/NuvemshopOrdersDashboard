import { Order } from "@/types/order";
import { OrderRow } from "./OrderRow";
import { OrderCard } from "./OrderCard";
import { useTranslation } from 'react-i18next';

interface OrderTableProps {
  orders: Order[];
  onUpdateNote: (orderId: string, note: string) => void;
  onDeleteNote: (orderId: string) => void;
  onToggleAttention: (orderId: string) => void;
}

export const OrderTable = ({ orders, onUpdateNote, onDeleteNote, onToggleAttention }: OrderTableProps) => {
  const { t } = useTranslation();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">{t('dashboard.noOrdersFound')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground min-w-[120px]">
                  {t('orders.orderId')}
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground min-w-[150px]">
                  {t('orders.customer')}
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground min-w-[100px]">
                  {t('orders.orderDate')}
                </th>
                <th className="px-3 py-3 text-center text-sm font-medium text-muted-foreground min-w-[80px]">
                  {t('orders.daysDelayed')}
                </th>
                <th className="px-3 py-3 text-center text-sm font-medium text-muted-foreground min-w-[100px]">
                  {t('orders.status')}
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground min-w-[200px]">
                  {t('orders.note')}
                </th>
                <th className="px-3 py-3 text-center text-sm font-medium text-muted-foreground min-w-[80px]">
                  {t('orders.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                  onToggleAttention={onToggleAttention}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            onToggleAttention={onToggleAttention}
          />
        ))}
      </div>
    </>
  );
};
