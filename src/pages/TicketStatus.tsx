
import Header from '@/components/Header';
import TicketTracker from '@/components/TicketTracker';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { findTicketById, SupportTicket } from '@/utils/ticketUtils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const TicketStatus = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (id: string) => {
    try {
      setLoading(true);
      const fetchedTicket = await findTicketById(id);
      
      if (fetchedTicket) {
        setTicket(fetchedTicket);
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الطلب",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الطلب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'open': 'مفتوحة',
      'inprogress': 'قيد المعالجة',
      'resolved': 'تم الحل',
      'closed': 'مغلقة'
    };
    return statusMap[status] || status;
  };

  const getStatusColorClass = (status: string) => {
    const statusColorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      'open': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'inprogress': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      'resolved': 'bg-green-100 text-green-800 hover:bg-green-100',
      'closed': 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    return statusColorMap[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-background bg-pattern-light">
      <Header />
      <main className="container px-4 py-8">
        <div className="flex flex-col items-end mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-right text-company">متابعة طلب الدعم الفني</h2>
          <div className="w-40 h-1 bg-accent-gold mb-4"></div>
          <DateTimeDisplay />
        </div>

        {loading ? (
          <Card className="border-company/20 glass text-center p-8">
            <div className="flex flex-col items-center justify-center h-48">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4">جاري تحميل بيانات الطلب...</p>
            </div>
          </Card>
        ) : ticket ? (
          <div className="space-y-6">
            <Card className="border-company/20 glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColorClass(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                  <CardTitle className="text-right text-xl">
                    تفاصيل الطلب #{ticket.ticket_id}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-right font-medium">الرقم الوظيفي:</p>
                    <p className="text-right">{ticket.employee_id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-right font-medium">الفرع:</p>
                    <p className="text-right">{ticket.branch}</p>
                  </div>
                  
                  {ticket.anydesk_number && (
                    <div className="space-y-2">
                      <p className="text-right font-medium">رقم Anydesk:</p>
                      <p className="text-right">{ticket.anydesk_number}</p>
                    </div>
                  )}
                  
                  {ticket.extension_number && (
                    <div className="space-y-2">
                      <p className="text-right font-medium">رقم التحويلة:</p>
                      <p className="text-right">{ticket.extension_number}</p>
                    </div>
                  )}
                  
                  {/* Display custom fields if they exist */}
                  {ticket.custom_fields && typeof ticket.custom_fields === 'object' && 
                    Object.entries(ticket.custom_fields).map(([key, value]) => (
                      <div className="space-y-2" key={key}>
                        <p className="text-right font-medium">{key}:</p>
                        <p className="text-right">{String(value)}</p>
                      </div>
                    ))
                  }
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-right font-medium">وصف المشكلة:</p>
                  <div className="p-4 bg-gray-50 rounded-md border text-right">
                    {ticket.description}
                  </div>
                </div>
                
                {ticket.image_url && (
                  <div className="space-y-2">
                    <p className="text-right font-medium">الصورة المرفقة:</p>
                    <div className="flex justify-center">
                      <img 
                        src={ticket.image_url} 
                        alt="صورة مرفقة" 
                        className="max-h-64 object-contain rounded-md border"
                      />
                    </div>
                  </div>
                )}
                
                {ticket.response && (
                  <div className="space-y-2">
                    <p className="text-right font-medium">رد الدعم الفني:</p>
                    <div className="p-4 bg-company-light/20 rounded-md border border-company/20 text-right">
                      {ticket.response}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <TicketTracker />
          </div>
        ) : (
          <Card className="border-company/20 glass text-center p-8">
            <CardContent>
              <p className="text-lg">لم يتم العثور على الطلب</p>
              <p className="text-muted-foreground mt-2">يرجى التأكد من رقم الطلب والمحاولة مرة أخرى</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TicketStatus;
