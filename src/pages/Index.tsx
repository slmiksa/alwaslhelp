
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      <main className="container px-4 py-8">
        <div className="flex flex-col items-end mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-right">نظام الدعم الفني</h2>
          <DateTimeDisplay />
        </div>
        <SupportForm />
      </main>
    </div>
  );
};

export default Index;
