
import FileUpload from './FileUpload';
import FilterForm from './FilterForm';
import { Card } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';

const Dashboard = () => {
  const { fileStatus } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Upload and process Partner Center exports</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload />
        <FilterForm />
      </div>

      {fileStatus === 'processed' && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Processing Summary</h2>
          <p className="text-muted-foreground">
            The file has been processed successfully. You can now view the report by clicking the "View Report" button in the Filter section.
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Product dictionary updated with new entries</li>
            <li>Products marked as Echo are identified</li>
            <li>Transaction data is ready for reporting</li>
          </ul>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
