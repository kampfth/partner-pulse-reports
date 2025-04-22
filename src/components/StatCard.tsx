
import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  trend?: ReactNode;
}

const StatCard = ({ icon, title, value, trend }: StatCardProps) => {
  return (
    <div className="glass-card rounded-lg p-5 flex items-center space-x-4">
      <div className="p-3 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm text-muted-foreground uppercase">{title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold">{value}</p>
          {trend && <div className="text-green-400">{trend}</div>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
