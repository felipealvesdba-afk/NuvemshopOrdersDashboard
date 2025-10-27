import { useState } from "react";
import { AlertCircle, Save, Star, Trash2, X } from "lucide-react";
import { Order } from "@/types/order";
import { calculateDaysInDelay, isOrderDelayed, isOrderOverdue, calculateOverdueDays } from "@/utils/orderUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface OrderRowProps {
  order: Order;
  onUpdateNote: (orderId: string, note: string) => void;
  onDeleteNote: (orderId: string) => void;
  onToggleAttention: (orderId: string) => void;
}

export const OrderRow = ({ order, onUpdateNote, onDeleteNote, onToggleAttention }: OrderRowProps) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(order.note || '');
  const daysDelayed = order.days_in_ready_to_pack;
  const isDelayed = order.is_delayed;
  const isOverdue = isOrderOverdue(order);
  const overdueDays = calculateOverdueDays(order);
  const { t } = useTranslation();

  const handleSaveNote = () => {
    onUpdateNote(String(order.id), noteValue);
    setIsEditingNote(false);
  };

  const handleDeleteNote = () => {
    onDeleteNote(String(order.id));
    setIsEditingNote(false);
  };

  const handleCancelEdit = () => {
    setNoteValue(order.note || '');
    setIsEditingNote(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <tr
      className={cn(
        "border-b border-border hover:bg-accent/50 transition-colors",
        isOverdue && "bg-red-50 border-red-200 hover:bg-red-100",
        !isOverdue && isDelayed && "bg-warning-light"
      )}
    >
      <td className="px-3 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">#{order.number}</span>
          {order.attention && (
            <Star className="h-4 w-4 fill-warning text-warning flex-shrink-0" />
          )}
        </div>
      </td>
      <td className="px-3 py-4 text-foreground" title={order.customer_name}>
        <div className="break-words">{order.customer_name}</div>
      </td>
      <td className="px-3 py-4 text-muted-foreground text-center">
        {formatDate(order.order_date)}
      </td>
      <td className="px-3 py-4 text-center">
        {isOverdue ? (
          <div className="flex items-center justify-center gap-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-red-600 text-xs">{overdueDays}d</span>
          </div>
        ) : isDelayed ? (
          <div className="flex items-center justify-center gap-1">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning text-xs">{daysDelayed}d</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-3 py-4 text-center">
        <Badge
          variant={order.shipping_status === "shipped" ? "secondary" : "default"}
          className={cn(
            order.shipping_status === "unpacked" && "bg-primary/10 text-primary hover:bg-primary/20",
            "text-xs"
          )}
        >
          {t(`status.${order.shipping_status}`)}
        </Badge>
      </td>
      <td className="px-3 py-4">
        {isEditingNote ? (
          <div className="flex items-center gap-1">
            <Input
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              className="h-7 text-xs flex-1 min-w-0"
              placeholder={t('orders.notePlaceholder')}
              autoFocus
            />
            <Button size="sm" onClick={handleSaveNote} className="h-7 w-7 p-0 flex-shrink-0">
              <Save className="h-3 w-3" />
            </Button>
            {order.note && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDeleteNote} 
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancelEdit} 
              className="h-7 w-7 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNote(true)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer min-h-[28px] flex items-center break-words"
            title={order.note || t('orders.notePlaceholder')}
          >
            {order.note || t('orders.notePlaceholder')}
          </div>
        )}
      </td>
      <td className="px-3 py-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleAttention(String(order.id))}
          className={cn(
            "h-8 w-8 p-0",
            order.attention && "text-warning hover:text-warning"
          )}
        >
          <Star className={cn("h-4 w-4", order.attention && "fill-current")} />
        </Button>
      </td>
    </tr>
  );
};
