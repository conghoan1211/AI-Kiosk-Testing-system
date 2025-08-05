import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users } from 'lucide-react';

interface Stats {
  totalActivities: number;
  activeUsers: number;
}

interface ActivityStatsProps {
  stats: Stats;
}

export function ActivityStats({ stats }: ActivityStatsProps) {
  const statCards = [
    {
      title: 'Tổng hoạt động',
      value: stats.totalActivities.toLocaleString(),
      subtitle: 'Trong 30 ngày qua',
      icon: Activity,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Người dùng hoạt động',
      value: stats.activeUsers.toString(),
      subtitle: 'Trong 24h qua',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div
                  className={`h-12 w-12 ${stat.bgColor} flex items-center justify-center rounded-lg`}
                >
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
