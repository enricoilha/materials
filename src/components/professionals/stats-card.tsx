import {
  ListChecks,
  Clock,
  DollarSign,
  Users,
  ClipboardList,
  BarChart2,
} from "lucide-react";

type StatsCardProps = {
  title: string;
  value: string;
  icon: "list" | "clock" | "dollar" | "users" | "clipboard" | "chart";
};

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "list":
        return <ListChecks className="w-6 h-6 text-blue-600" />;
      case "clock":
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case "dollar":
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case "users":
        return <Users className="w-6 h-6 text-purple-600" />;
      case "clipboard":
        return <ClipboardList className="w-6 h-6 text-indigo-600" />;
      case "chart":
        return <BarChart2 className="w-6 h-6 text-red-600" />;
      default:
        return <ListChecks className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {getIcon()}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
