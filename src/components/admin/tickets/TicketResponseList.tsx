
import { Separator } from '@/components/ui/separator';

interface TicketResponse {
  id: string;
  response: string;
  is_admin: boolean;
  created_at: string;
  admin_name?: string | null;
}

interface TicketResponseListProps {
  responses: TicketResponse[];
}

const TicketResponseList = ({ responses }: TicketResponseListProps) => {
  if (responses.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        لا توجد ردود بعد
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div 
          key={response.id} 
          className={`p-4 rounded-lg ${
            response.is_admin 
              ? 'bg-company-light border border-company/20 ml-8' 
              : 'bg-gray-100 mr-8'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500">
              {new Date(response.created_at).toLocaleString('ar-SA')}
            </span>
            <span className="font-medium">
              {response.is_admin 
                ? response.admin_name || 'الدعم الفني' 
                : 'الموظف'}
            </span>
          </div>
          <p className="text-right">{response.response}</p>
        </div>
      ))}
    </div>
  );
};

export default TicketResponseList;
