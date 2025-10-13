import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, X, Flag, AlertTriangle, CircleCheck, Bell, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { deleteTicket } from '@/utils/ticketUtils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
const statusColorMap = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200',
  open: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
  inprogress: 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200',
  resolved: 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200',
  closed: 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
};
const priorityColorMap = {
  urgent: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200',
  medium: 'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200',
  normal: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
};
const priorityIconMap = {
  urgent: <Flag className="h-4 w-4 mr-1" />,
  medium: <AlertTriangle className="h-4 w-4 mr-1" />,
  normal: <CircleCheck className="h-4 w-4 mr-1" />
};
const statusLabels = {
  pending: 'قيد الانتظار',
  open: 'مفتوحة',
  inprogress: 'جاري المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة'
};
const priorityLabels = {
  urgent: 'عاجلة',
  medium: 'متوسطة',
  normal: 'عادية'
};
const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 30;
  const {
    isAuthenticated
  } = useAdminAuth();
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
      setupRealtimeSubscription();
    }
  }, [isAuthenticated]);
  const setupRealtimeSubscription = () => {
    const channel = supabase.channel('admin-dashboard-tickets').on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'tickets'
    }, payload => {
      const newTicket = payload.new;
      toast(<div className="flex items-start space-x-2 rtl:space-x-reverse">
            <Bell className="h-5 w-5 text-company flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-base">تذكرة جديدة</div>
              <div className="text-sm">تم استلام تذكرة جديدة: {newTicket.ticket_id}</div>
              <div className="text-sm">الفرع: {newTicket.branch}</div>
              <div className="text-sm">الأهمية: {priorityLabels[newTicket.priority] || 'عادية'}</div>
              <div className="text-sm">الموظف: {newTicket.employee_id}</div>
            </div>
          </div>, {
        duration: 30000,
        position: 'top-left',
        onDismiss: () => console.log("تم إغلاق الإشعار"),
        onAutoClose: () => console.log("تم إغلاق الإشعار تلقائيًا"),
        action: {
          label: "عرض التذكرة",
          onClick: () => navigate(`/admin/tickets/${newTicket.ticket_id}`)
        },
        closeButton: true
      });
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Could not play notification sound:', e));
      } catch (e) {
        console.log('Error playing notification sound:', e);
      }
      setTickets(prevTickets => {
        return [newTicket, ...prevTickets];
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  };
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('tickets').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('فشل في تحميل التذاكر');
    } finally {
      setLoading(false);
    }
  };
  const filterTickets = () => {
    let filtered = [...tickets];
    if (activeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => ticket.ticket_id.toLowerCase().includes(query) || ticket.employee_id.toLowerCase().includes(query) || ticket.branch.toLowerCase().includes(query) || ticket.description.toLowerCase().includes(query));
    }
    return filtered;
  };

  const getPaginatedTickets = () => {
    const filtered = filterTickets();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filterTickets().length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);
  const handleViewTicket = ticketId => {
    navigate(`/admin/tickets/${ticketId}`);
  };
  const getPriorityDisplay = priority => {
    const actualPriority = priority || 'normal';
    return <Badge className={`font-medium px-3 py-1 rounded-md text-sm flex items-center ${priorityColorMap[actualPriority] || 'bg-green-100'}`}>
        {priorityIconMap[actualPriority]}
        {priorityLabels[actualPriority] || 'عادية'}
      </Badge>;
  };
  const handleDeleteTicket = async (ticketId: string) => {
    if (confirm(`هل أنت متأكد من حذف التذكرة ${ticketId}؟`)) {
      try {
        const success = await deleteTicket(ticketId);
        if (success) {
          toast.success('تم حذف التذكرة بنجاح');
          setTickets(prevTickets => prevTickets.filter(ticket => ticket.ticket_id !== ticketId));
        } else {
          toast.error('فشل في حذف التذكرة');
          console.error('Failed to delete ticket');
        }
      } catch (error) {
        console.error('Error deleting ticket:', error);
        toast.error('حدث خطأ أثناء محاولة حذف التذكرة');
      }
    }
  };
  const {
    hasPermission
  } = useAdminAuth();
  const canDeleteTickets = hasPermission('delete_tickets');
  return <div className="min-h-screen bg-white">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-md border-company-light">
          <CardHeader className="pb-3 bg-gradient-primary rounded-t-lg">
            <CardTitle className="text-right text-2xl font-bold text-white">إدارة تذاكر الدعم الفني</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-company" />
                </div>
                <Input placeholder="بحث عن تذكرة..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-10 text-right border-company/20 focus:border-company focus:ring-1 focus:ring-company" dir="rtl" />
                {searchQuery && <button className="absolute inset-y-0 left-0 flex items-center pl-3" onClick={() => setSearchQuery('')}>
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>}
              </div>

              <div className="w-full md:w-2/3">
                <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-gray-100">
                    <TabsTrigger value="all" className="data-[state=active]:bg-company data-[state=active]:text-white">
                      الكل
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                      قيد الانتظار
                    </TabsTrigger>
                    <TabsTrigger value="open" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                      مفتوحة
                    </TabsTrigger>
                    <TabsTrigger value="inprogress" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                      جاري المعالجة
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      تم الحل
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white">
                      مغلقة
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {loading ? <div className="text-center py-12">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-company border-r-transparent"></div>
                <p className="mt-4 text-lg font-medium text-company">جاري تحميل التذاكر...</p>
              </div> : <div className="rounded-md border-2 border-gray-200 overflow-hidden shadow-sm dark:border-gray-700">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                      <TableHead className="text-right font-bold text-company py-4">رقم التذكرة</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الرقم الوظيفي</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الفرع</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الأهمية</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الحالة</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedTickets().length > 0 ? getPaginatedTickets().map(ticket => <TableRow key={ticket.id} className="hover:bg-gray-50 border-b border-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                          <TableCell className="font-medium text-right py-4 dark:text-gray-200">{ticket.ticket_id}</TableCell>
                          <TableCell className="text-right py-4 dark:text-gray-200">{ticket.employee_id}</TableCell>
                          <TableCell className="text-right py-4 dark:text-gray-200">{ticket.branch}</TableCell>
                          <TableCell className="text-right py-4">
                            {getPriorityDisplay(ticket.priority)}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <Badge className={`font-medium px-3 py-1 rounded-md text-sm ${statusColorMap[ticket.status] || 'bg-gray-100'}`}>
                              {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4 dark:text-gray-200">
                            {new Date(ticket.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric'
                    })}
                          </TableCell>
                          <TableCell className="py-4 flex items-center gap-2">
                            <Button size="sm" onClick={() => handleViewTicket(ticket.ticket_id)} className="bg-company hover:bg-company-dark">
                              عرض التفاصيل
                            </Button>
                            
                            {canDeleteTickets && <Button size="sm" variant="destructive" onClick={() => handleDeleteTicket(ticket.ticket_id)} title="حذف التذكرة" className="px-2">
                                <Trash2 className="h-4 w-4" />
                              </Button>}
                          </TableCell>
                        </TableRow>) : <TableRow>
                        <TableCell colSpan={7} className="text-center h-32">
                          {searchQuery ? <p className="text-lg text-gray-500">لا توجد تذاكر تطابق معايير البحث</p> : <p className="text-lg text-gray-500">لا توجد تذاكر {activeFilter !== 'all' ? `بحالة ${statusLabels[activeFilter]}` : ''}</p>}
                        </TableCell>
                      </TableRow>}
                  </TableBody>
                </Table>
              </div>}
            
            {!loading && filterTickets().length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filterTickets().length)} من {filterTickets().length} تذكرة
                </div>
                
                {totalPages > 1 && (
                  <Pagination dir="rtl">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        >
                          السابق
                        </PaginationPrevious>
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        >
                          التالي
                        </PaginationNext>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>;
};
export default AdminDashboard;