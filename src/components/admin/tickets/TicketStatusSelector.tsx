
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusOptions } from '@/utils/ticketStatusUtils';

interface TicketStatusSelectorProps {
  ticketId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
  disabled: boolean;
  canChangeStatus: boolean;
  currentAdmin: any;
}

const TicketStatusSelector = ({
  ticketId,
  currentStatus,
  onStatusUpdate,
  disabled,
  canChangeStatus,
  currentAdmin
}: TicketStatusSelectorProps) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (currentStatus === newStatus) return;
    
    if (!canChangeStatus) {
      toast.error('ليس لديك صلاحية لتغيير حالة التذكرة');
      return;
    }

    setUpdatingStatus(true);
    try {
      const { data, error } = await supabase.rpc('update_ticket_status', {
        p_ticket_id: ticketId,
        p_status: newStatus
      });

      if (error) {
        throw error;
      }

      if ((newStatus === 'resolved' || newStatus === 'closed') && 
          (!currentStatus || currentStatus === '') && 
          currentAdmin) {
        
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ assigned_to: currentAdmin.username })
          .eq('ticket_id', ticketId);

        if (updateError) {
          console.error('Error auto-assigning ticket:', updateError);
        }
      }

      onStatusUpdate(newStatus);
      toast.success('تم تحديث حالة التذكرة بنجاح');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('فشل في تحديث حالة التذكرة');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex items-center">
      <span className="ml-2 text-right font-medium">تغيير الحالة:</span>
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={updatingStatus || disabled || !canChangeStatus}
      >
        <SelectTrigger className={`w-36 ml-2 ${!canChangeStatus ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <SelectValue placeholder="اختر الحالة" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TicketStatusSelector;
