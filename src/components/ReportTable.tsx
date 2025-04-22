
import { useEffect, useState } from 'react';
import { generateReport, ReportItem } from '@/services/reportService';
import { useAppContext } from '@/context/AppContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Copy, Calendar } from 'lucide-react';

const ReportTable = () => {
  const { startDate, endDate, echoOnly } = useAppContext();
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await generateReport(startDate, endDate, echoOnly);
        console.log("Report data loaded:", data.length, "items");
        setReportData(data);
        setTotalItems(data.length);
        
        if (data.length === 0) {
          toast.info('No data found for the selected filters');
        }
      } catch (err) {
        console.error("Error loading report data:", err);
        setError('Failed to load report data');
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [startDate, endDate, echoOnly]);

  const handleCopyValues = () => {
    const formattedData = reportData.map(item => 
      `${item.name}: ${formatCurrency(item.total)}`
    ).join('\n');
    
    const totalSum = reportData.reduce((sum, item) => sum + item.total, 0);
    const summary = `Sales Report (${startDate || 'All time'} to ${endDate || 'Present'})\n\n${formattedData}\n\nTotal: ${formatCurrency(totalSum)}`;
    
    navigator.clipboard.writeText(summary)
      .then(() => toast.success('Report data copied to clipboard'))
      .catch(() => toast.error('Failed to copy data'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-lg text-gray-400">Loading report data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const totalAmount = reportData.reduce((sum, item) => sum + item.total, 0);
  const dateRange = startDate && endDate 
    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    : 'All time';

  return (
    <div className="glass-card rounded-lg p-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Sales Report</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Products: {totalItems}</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            {dateRange}
          </Button>
          
          <Button variant="secondary" onClick={handleCopyValues} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy values
          </Button>
        </div>
      </div>
      
      {reportData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No data found for the selected filters</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside text-left">
              <li>Try adjusting the date range</li>
              <li>If "Echo Products Only" is selected, you may not have any Echo products</li>
              <li>Make sure a file has been processed successfully</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="min-w-[350px] whitespace-normal">Product Name</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={`${item.productId || item.name}-${index}`}>
                      <TableCell className="min-w-[350px] whitespace-normal break-words">
                        <div className="max-w-full">{item.name}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
