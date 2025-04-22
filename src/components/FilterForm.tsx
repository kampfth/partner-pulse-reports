
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { processFile } from '@/services/fileService';
import { toast } from 'sonner';

const FilterForm = () => {
  const { 
    fileStatus, 
    setFileStatus, 
    setActiveSection,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    echoOnly,
    setEchoOnly
  } = useAppContext();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (fileStatus !== 'uploaded') {
      toast.error('Please upload a file first');
      return;
    }

    setIsProcessing(true);
    setFileStatus('processing');

    try {
      const result = await processFile();
      
      if (result.success) {
        setFileStatus('processed');
        toast.success('File processed successfully');
      } else {
        setFileStatus('uploaded');
        toast.error('Error processing file');
      }
    } catch (error) {
      setFileStatus('uploaded');
      toast.error('Error processing file');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewReport = () => {
    if (fileStatus === 'processed') {
      setActiveSection('reports');
    }
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Filter</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="startDate" className="text-sm mb-1 block">From</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-muted"
          />
        </div>
        
        <div>
          <Label htmlFor="endDate" className="text-sm mb-1 block">To</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-muted"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-6">
        <Checkbox 
          id="echoOnly" 
          checked={echoOnly}
          onCheckedChange={(checked) => setEchoOnly(checked as boolean)}
        />
        <Label htmlFor="echoOnly" className="font-medium">Echo Products Only</Label>
      </div>
      
      {fileStatus === 'processed' ? (
        <Button 
          onClick={handleViewReport}
          className="w-full"
        >
          View Report
        </Button>
      ) : (
        <Button 
          onClick={handleProcess}
          disabled={fileStatus !== 'uploaded' || isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Process the file'}
        </Button>
      )}
    </div>
  );
};

export default FilterForm;
