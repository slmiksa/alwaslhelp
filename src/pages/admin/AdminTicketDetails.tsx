import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTicketDetails } from '@/hooks/useTicketDetails';
import TicketDetailsCard from '@/components/admin/tickets/TicketDetailsCard';
import TicketResponseList from '@/components/admin/tickets/TicketResponseList';
import TicketResponseForm from '@/components/admin/tickets/TicketResponseForm';

const AdminTicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { hasPermission, currentAdmin } = useAdminAuth();
  
  const {
    ticket,
    responses,
    loading,
    assignedAdmin,
    updatingStatus,
    fetchTicketAndResponses,
    handleStatusChange,
    setUpdatingStatusState
  } = useTicketDetails(ticketId);

  const canChangeTicketStatus = hasPermission('manage_tickets');
  const canRespondToTickets = hasPermission('respond_to_tickets');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">جاري تحميل بيانات التذكرة...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-10">
              <p>التذكرة غير موجودة</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/admin/dashboard')}
              >
                العودة إلى القائمة
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ChevronRight className="h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </div>

        <TicketDetailsCard 
          ticket={ticket}
          assignedAdmin={assignedAdmin}
          canChangeTicketStatus={canChangeTicketStatus}
          handleStatusChange={handleStatusChange}
          updatingStatus={updatingStatus}
          currentAdmin={currentAdmin}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-right">الردود</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TicketResponseList responses={responses} />
            
            <TicketResponseForm
              ticketId={ticketId || ''}
              ticket={ticket}
              currentAdmin={currentAdmin}
              responses={responses}
              onResponseSubmitted={fetchTicketAndResponses}
              canRespond={canRespondToTickets}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminTicketDetails;
