
import { useAppContext } from "@/context/AppContext";
import { Upload, BarChart, Settings } from "lucide-react";

const Sidebar = () => {
  const { activeSection, setActiveSection, fileStatus } = useAppContext();

  return (
    <div className="w-64 h-[85vh] bg-sidebar rounded-lg p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center">
          Partner<span className="text-blue-400">Pulse</span>
          <span className="text-lg ml-1">.</span>
        </h1>
        <p className="text-gray-400 text-sm">Microsoft Partner Analysis</p>
      </div>
      
      <nav className="space-y-1 flex-1">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`sidebar-item w-full text-left ${
            activeSection === 'dashboard' ? 'sidebar-item-active' : 'sidebar-item-inactive'
          }`}
        >
          <Upload size={18} />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => fileStatus === 'processed' && setActiveSection('reports')}
          className={`sidebar-item w-full text-left ${
            activeSection === 'reports' 
              ? 'sidebar-item-active' 
              : fileStatus === 'processed'
                ? 'sidebar-item-inactive'
                : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={fileStatus !== 'processed'}
        >
          <BarChart size={18} />
          <span>Reports</span>
        </button>
        
        <button
          onClick={() => setActiveSection('control-panel')}
          className={`sidebar-item w-full text-left ${
            activeSection === 'control-panel' ? 'sidebar-item-active' : 'sidebar-item-inactive'
          }`}
        >
          <Settings size={18} />
          <span>Control Panel</span>
        </button>
      </nav>
      
      <div className="text-xs text-gray-500 pt-4 border-t border-gray-800">
        <p>v1.0.0 | © 2025 PartnerPulse</p>
      </div>
    </div>
  );
};

export default Sidebar;
