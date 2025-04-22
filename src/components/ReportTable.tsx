
import { useEffect, useState } from 'react';
import { generateReport, ReportItem } from '@/services/reportService';
import { useAppContext } from '@/context/AppContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

const ReportTable = () => {
  const { startDate, endDate, echoOnly } = useAppContext();
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await generateReport(startDate, endDate, echoOnly);
        setReportData(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [startDate, endDate, echoOnly]);

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

  return (
    <div className="glass-card rounded-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Sales Report</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-right">Total Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((item) => (
              <TableRow key={item.productId || item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
            {reportData.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  No data found for the selected filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportTable;
