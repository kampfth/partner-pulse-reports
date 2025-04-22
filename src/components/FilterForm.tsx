
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { processFile } from '@/services/fileService';
import { updateProductFromCSV } from '@/services/reportService';
import { toast } from 'sonner';
import { supabase } from '@/services/supabaseClient';

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
    setEchoOnly,
    uploadedFilePath
  } = useAppContext();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (fileStatus !== 'uploaded') {
      toast.error('Please upload a file first');
      return;
    }

    if (!uploadedFilePath) {
      toast.error('No file path available');
      return;
    }

    setIsProcessing(true);
    setFileStatus('processing');

    try {
      // Process the uploaded file
      const processedData = await processFile(uploadedFilePath);
      console.log("Processed data", { 
        productsCount: processedData.products.length, 
        transactionsCount: processedData.transactions.length 
      });
      
      // Check for anonymous permissions since we're not using auth in this demo
      const { data: rls } = await supabase.rpc('check_rls_permissions');
      console.log("RLS permissions check:", rls);
      
      // Update product dictionary with new data
      const result = await updateProductFromCSV(processedData);
      
      if (result) {
        setFileStatus('processed');
        toast.success('File processed successfully');
      } else {
        // Even if there's an error saving to database, we'll still consider the file processed
        // for demo purposes, so Reports tab becomes available
        setFileStatus('processed');
        toast.warning('File processed, but there may be issues saving to database');
        console.warn('Issues saving to database, but file was processed');
      }
    } catch (error) {
      console.error("Processing error:", error);
      // Even if there's an error, we'll still mark as processed for demo purposes
      setFileStatus('processed');
      toast.warning('There were some issues processing the file, but you can view the report');
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
