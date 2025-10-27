import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  overdueOnly: boolean;
  onOverdueOnlyChange: (checked: boolean) => void;
  onRefresh: () => void;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  overdueOnly,
  onOverdueOnlyChange,
  onRefresh,
}: FilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex gap-2 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={onSearch} variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          {t('dashboard.search')}
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder={t('dashboard.filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t('dashboard.filterByStatus')}</SelectItem>
          <SelectItem value="unpacked">{t('status.unpacked')}</SelectItem>
          <SelectItem value="unshipped">{t('status.unshipped')}</SelectItem>
          <SelectItem value="shipped">{t('status.shipped')}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-md border border-border">
        <Checkbox
          id="overdue"
          checked={overdueOnly}
          onCheckedChange={onOverdueOnlyChange}
        />
        <label
          htmlFor="overdue"
          className="text-sm text-foreground cursor-pointer select-none"
        >
          {t('dashboard.showOverdueOnly')}
        </label>
      </div>

      <Button onClick={onRefresh} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        {t('dashboard.refreshOrders')}
      </Button>
    </div>
  );
};
