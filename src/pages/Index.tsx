
import { useAppContext } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ReportTable from "@/components/ReportTable";
import ControlPanel from "@/components/ControlPanel";

const Index = () => {
  const { activeSection } = useAppContext();

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="flex gap-6 mx-auto max-w-[1200px]">
        <Sidebar />
        
        <div className="flex-1 max-w-[900px]">
          {activeSection === 'dashboard' && <Dashboard />}
          {activeSection === 'reports' && <ReportTable />}
          {activeSection === 'control-panel' && <ControlPanel />}
        </div>
      </div>
    </div>
  );
};

export default Index;
