
import { Users, DollarSign, FileText, TrendingUp } from 'lucide-react';
import FileUpload from './FileUpload';
import FilterForm from './FilterForm';
import StatCard from './StatCard';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Last 24h Statistics</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<Users className="text-blue-400" />} 
          title="Users" 
          value="+28" 
          trend={<TrendingUp size={16} />} 
        />
        <StatCard 
          icon={<DollarSign className="text-green-400" />} 
          title="Income" 
          value="$2,873.88" 
          trend={<TrendingUp size={16} />} 
        />
        <StatCard 
          icon={<FileText className="text-purple-400" />} 
          title="Invoices" 
          value="+79" 
          trend={<TrendingUp size={16} />} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload />
        <FilterForm />
      </div>
    </div>
  );
};

export default Dashboard;
