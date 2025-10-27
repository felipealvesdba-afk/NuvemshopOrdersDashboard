import { Package, AlertCircle, Clock, Truck, Eye, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OrderStats } from "@/types/order";
import { useTranslation } from 'react-i18next';

interface SummaryBarProps {
  stats: OrderStats;
}

export const SummaryBar = ({ stats }: SummaryBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
      <Card className="p-3 md:p-4 border-border hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.totalOrders')}</p>
            <p className="text-lg md:text-2xl font-semibold text-foreground">{stats.totalOrders}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-border hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-accent flex-shrink-0">
            <Package className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.readyToPack')}</p>
            <p className="text-lg md:text-2xl font-semibold text-foreground">{stats.totalReadyToPack}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-border hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-primary flex-shrink-0">
            <Truck className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.sent')}</p>
            <p className="text-lg md:text-2xl font-semibold text-foreground">{stats.totalSent}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-border hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-warning-light flex-shrink-0">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.delayedOrders')}</p>
            <p className="text-lg md:text-2xl font-semibold text-warning">{stats.totalDelayed}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-border hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-destructive flex-shrink-0">
            <Eye className="h-4 w-4 md:h-5 md:w-5 text-destructive-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.attentionOrders')}</p>
            <p className="text-lg md:text-2xl font-semibold text-destructive">{stats.totalAttention}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-border hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-muted flex-shrink-0">
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.lastUpdated')}</p>
            <p className="text-sm md:text-lg font-medium text-foreground">{stats.lastUpdated}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
