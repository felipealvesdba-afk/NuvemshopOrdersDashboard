import { useState, useEffect } from "react";
import { LabelPrint, Order } from "@/types/order";
import { filterOrders, getOrderStats, sortOrders } from "@/utils/orderUtils";
import { SummaryBar } from "@/components/SummaryBar";
import { FilterBar } from "@/components/FilterBar";
import { OrderTable } from "@/components/OrderTable";
import UserProfile from "@/components/UserProfile";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("any");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [storedCounts, setStoredCounts] = useState({ unshipped: 0, shipped: 0 });
  const { user } = useAuth();
  const { t } = useTranslation();

  const stats = getOrderStats(orders, totalCount, storedCounts);

  // Fetch orders from backend
  const [labelPrints, setLabelPrints] = useState<LabelPrint[]>([]);

  const fetchLabelPrints = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/etiquetas?dias=7`);
      if (!response.ok) return;
      const data = await response.json();
      setLabelPrints(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.warn('Error fetching label prints:', error);
    }
  };

  const fetchOrders = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      console.log(`Fetching orders from backend - Page: ${page}, Per Page: ${itemsPerPage}`);
      
      const token = localStorage.getItem('auth_token');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString(),
        search: searchTerm,
        shipping_status: statusFilter,
        overdue_only: overdueOnly.toString(),
        attention_only: (activeTab === 'attention').toString()
      });
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Orders fetched successfully:', data);
      
      if (data.success && data.data) {
        setOrders(data.data);
        // Update total pages and count if provided by backend
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
        if (data.totalCount) {
          setTotalCount(data.totalCount);
        }
        toast.success(t('notifications.orderUpdated'));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('errors.networkError'));
      // Fallback to mock data if backend is not available
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stored counts from Firebase (with fallback to first page counts)
  const fetchStoredCounts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/counts/stored`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stored counts: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setStoredCounts({
          unshipped: data.data.unshipped || 0,
          shipped: data.data.shipped || 0
        });
        
        // Log if using fallback counts
        if (data.data.fallback) {
          console.log('Using fallback counts from first page (Firebase not available)');
        } else {
          console.log('Using Firebase stored counts');
        }
      }
    } catch (error) {
      console.error('Error fetching stored counts:', error);
      // Don't set any counts on error - let the system use page counts
    }
  };

  const handleUpdateNote = async (orderId: string, note: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/orders/${orderId}/note`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === orderId ? { ...order, note } : order
        )
      );
      toast.success(t('notifications.noteSaved'));
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(t('errors.networkError'));
    }
  };

  const handleDeleteNote = async (orderId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/orders/${orderId}/note`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === orderId ? { ...order, note: null } : order
        )
      );
      toast.success(t('notifications.noteDeleted'));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(t('errors.networkError'));
    }
  };

  const handleToggleAttention = async (orderId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const order = orders.find((o) => String(o.id) === orderId);
      const newAttentionState = !order?.attention;
      
      const response = await fetch(`/api/orders/${orderId}/note`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          note: order?.note || '', 
          attention: newAttentionState 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update attention status');
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === orderId
            ? { ...order, attention: newAttentionState }
            : order
        )
      );
      
      toast.success(t('notifications.attentionToggled'));
    } catch (error) {
      console.error('Error updating attention:', error);
      toast.error(t('errors.networkError'));
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchOrders(currentPage), fetchLabelPrints()]);
  };

  // Etiquetas impressas pelo robô, por número do pedido
  const labelByOrder = new Map(labelPrints.map((l) => [String(l.pedido), l.impresso_em]));
  const todayKey = new Date().toLocaleDateString('sv-SE');
  const labelsByDay = labelPrints.reduce<Record<string, LabelPrint[]>>((acc, l) => {
    const day = new Date(l.impresso_em).toLocaleDateString('sv-SE');
    (acc[day] = acc[day] || []).push(l);
    return acc;
  }, {});
  const labelsToday = (labelsByDay[todayKey] || []).length;

  // Display orders from backend (already paginated and filtered by backend)
  const displayedOrders = orders.map((o) => ({ ...o, label_printed_at: labelByOrder.get(String(o.number)) || null }));

  // Reset to first page and fetch data when filters change (except search term)
  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
  }, [statusFilter, overdueOnly, activeTab]);

  useEffect(() => {
    // Fetch orders and stored counts on component mount
    fetchOrders();
    fetchStoredCounts();
    fetchLabelPrints();

      // Auto-refresh every 15 minutes
      const interval = setInterval(() => {
        console.log("Auto-refreshing data...");
        fetchOrders(currentPage);
      }, 15 * 60 * 1000);
      // Etiquetas impressas: a cada 2 minutos
      const labelsInterval = setInterval(fetchLabelPrints, 2 * 60 * 1000);

    return () => { clearInterval(interval); clearInterval(labelsInterval); };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loadingOrders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('dashboard.subtitle')}
              </p>
              {user && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Welcome back, {user.name}!
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
              <LanguageSwitcher />
              <UserProfile />
            </div>
          </div>
        </header>

        <SummaryBar stats={stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">{t('dashboard.totalOrders')}</TabsTrigger>
            <TabsTrigger value="attention" className="gap-2">
              {t('dashboard.attentionOrders')}
              {orders.filter((o) => o.attention).length > 0 && (
                <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                  {orders.filter((o) => o.attention).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="labels" className="gap-2">
              <Printer className="h-4 w-4" />
              {t('labels.tab')}
              {labelsToday > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{labelsToday}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearch={() => fetchOrders(1)}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              overdueOnly={overdueOnly}
              onOverdueOnlyChange={setOverdueOnly}
              onRefresh={handleRefresh}
            />
            <OrderTable
              orders={displayedOrders}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onToggleAttention={handleToggleAttention}
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage > 1) {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            fetchOrders(newPage);
                          }
                        }}
                        disabled={currentPage <= 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('pagination.previous')}
                      </Button>
                    </PaginationItem>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1;
                      
                      if (!shouldShow) {
                        // Show ellipsis for gaps
                        if (page === 2 && currentPage > 4) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        if (page === totalPages - 1 && currentPage < totalPages - 3) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                              fetchOrders(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage < totalPages) {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            fetchOrders(newPage);
                          }
                        }}
                        disabled={currentPage >= totalPages}
                        className="gap-1"
                      >
                        {t('pagination.next')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t('pagination.showing')} {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} {t('pagination.of')} {totalCount} {t('pagination.orders')}
            </div>
          </TabsContent>

          <TabsContent value="attention" className="mt-6">
            <OrderTable
              orders={displayedOrders}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onToggleAttention={handleToggleAttention}
            />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage > 1) {
                            const newPage = currentPage - 1;
                            setCurrentPage(newPage);
                            fetchOrders(newPage);
                          }
                        }}
                        disabled={currentPage <= 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('pagination.previous')}
                      </Button>
                    </PaginationItem>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1;
                      
                      if (!shouldShow) {
                        // Show ellipsis for gaps
                        if (page === 2 && currentPage > 4) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        if (page === totalPages - 1 && currentPage < totalPages - 3) {
                          return (
                            <PaginationItem key={`ellipsis-${page}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                              fetchOrders(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage < totalPages) {
                            const newPage = currentPage + 1;
                            setCurrentPage(newPage);
                            fetchOrders(newPage);
                          }
                        }}
                        disabled={currentPage >= totalPages}
                        className="gap-1"
                      >
                        {t('pagination.next')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t('pagination.showing')} {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} {t('pagination.of')} {totalCount} {t('pagination.orders')}
            </div>
          </TabsContent>
          <TabsContent value="labels" className="mt-6">
            {labelPrints.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{t('labels.empty')}</p>
            ) : (
              <div className="space-y-6">
                {Object.keys(labelsByDay).sort().reverse().map((day) => (
                  <div key={day} className="rounded-lg border border-border">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                      <span className="font-medium">
                        {day === todayKey ? t('labels.today') : new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {labelsByDay[day].length} {t('labels.count')}
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="px-4 py-2 font-medium">{t('labels.order')}</th>
                          <th className="px-4 py-2 font-medium">{t('labels.printedAt')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labelsByDay[day].map((l) => (
                          <tr key={l.pedido} className="border-t border-border">
                            <td className="px-4 py-2 font-medium">#{l.pedido}</td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {new Date(l.impresso_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
