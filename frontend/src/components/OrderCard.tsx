import { useState } from "react";
import { AlertCircle, Save, Star, Trash2, X } from "lucide-react";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { isOrderOverdue, calculateOverdueDays } from "@/utils/orderUtils";

interface OrderCardProps {
  order: Order;
  onUpdateNote: (orderId: string, note: string) => void;
  onDeleteNote: (orderId: string) => void;
  onToggleAttention: (orderId: string) => void;
}

export const OrderCard = ({ order, onUpdateNote, onDeleteNote, onToggleAttention }: OrderCardProps) => {
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
    <Card className={cn(
      "border-border hover:shadow-md transition-shadow",
      isOverdue && "border-red-200 bg-red-50",
      !isOverdue && isDelayed && "border-warning bg-warning/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{order.id}</span>
            {order.attention && (
              <Star className="h-4 w-4 fill-warning text-warning" />
            )}
          </div>
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
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Customer */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('orders.customer')}
          </label>
          <p className="text-sm font-medium">{order.customer_name}</p>
        </div>

        {/* Order Date and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('orders.orderDate')}
            </label>
            <p className="text-sm">{formatDate(order.order_date)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('orders.status')}
            </label>
            <Badge
              variant={order.shipping_status === "shipped" ? "secondary" : "default"}
              className={cn(
                order.shipping_status === "unpacked" && "bg-primary/10 text-primary hover:bg-primary/20",
                "text-xs mt-1"
              )}
            >
              {t(`status.${order.shipping_status}`)}
            </Badge>
          </div>
        </div>

        {/* Days Delayed */}
        {(isOverdue || isDelayed) && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('orders.daysDelayed')}
            </label>
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className={cn(
                "h-4 w-4",
                isOverdue ? "text-red-500" : "text-warning"
              )} />
              <span className={cn(
                "font-medium text-sm",
                isOverdue ? "text-red-600" : "text-warning"
              )}>
                {isOverdue ? `${overdueDays} days` : `${daysDelayed} days`}
              </span>
            </div>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('orders.note')}
          </label>
          {isEditingNote ? (
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                className="h-8 text-sm flex-1"
                placeholder={t('orders.notePlaceholder')}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveNote} className="h-8 w-8 p-0">
                <Save className="h-3 w-3" />
              </Button>
              {order.note && (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDeleteNote} 
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancelEdit} 
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingNote(true)}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer mt-1 min-h-[32px] flex items-center"
              title={order.note || t('orders.notePlaceholder')}
            >
              {order.note || t('orders.notePlaceholder')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
