// components/Sidebar.tsx
"use client";
import { 
  LayoutDashboard, LineChart, FileText, PieChart, Clock, 
  Calendar, BarChart2, Activity, Settings, ChevronDown 
} from 'lucide-react';

const menuItems = [
  { id: "Dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "Trades", icon: LineChart, label: "Trades" },
  { id: "Reports", icon: FileText, label: "Reports" },
  { id: "Overview", icon: PieChart, label: "Overview" },
  { id: "Hourly", icon: Clock, label: "Hourly" },
  { id: "Weekly", icon: Calendar, label: "Weekly" },
  { id: "Monthly", icon: BarChart2, label: "Monthly" },
  { id: "Holding Time", icon: Activity, label: "Holding Time" },
];

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen fixed left-0 top-0 flex flex-col p-6 z-10 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">tradiry.</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === item.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
        <button className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-medium w-full px-2">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}