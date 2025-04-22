
import FileUpload from './FileUpload';
import FilterForm from './FilterForm';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Last 24h Statistics</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileUpload />
        <FilterForm />
      </div>
    </div>
  );
};

export default Dashboard;
