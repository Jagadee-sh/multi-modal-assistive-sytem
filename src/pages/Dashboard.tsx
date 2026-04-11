import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hand, Radio, Mic, Activity, BarChart3, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityItem {
  id: string;
  mode: string;
  text: string;
  time: string;
  timestamp: number;
}

interface Stats {
  totalTranslations: number;
  signLanguageCount: number;
  morseCodeCount: number;
  lipReadingCount: number;
  weeklyChange: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalTranslations: 0,
    signLanguageCount: 0,
    morseCodeCount: 0,
    lipReadingCount: 0,
    weeklyChange: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const loadDashboardData = () => {
      try {
        const storedStats = localStorage.getItem('mmacs-stats');
        const storedActivity = localStorage.getItem('mmacs-activity');
        
        if (storedStats) {
          setStats(JSON.parse(storedStats));
        } else {
          // Initialize with demo data
          const demoStats: Stats = {
            totalTranslations: 1247,
            signLanguageCount: 523,
            morseCodeCount: 489,
            lipReadingCount: 235,
            weeklyChange: 12
          };
          setStats(demoStats);
          localStorage.setItem('mmacs-stats', JSON.stringify(demoStats));
        }
        
        if (storedActivity) {
          setRecentActivity(JSON.parse(storedActivity));
        } else {
          // Initialize with demo data
          const demoActivity: ActivityItem[] = [
            { id: '1', mode: "Morse Code", text: "HELLO WORLD", time: "2 min ago", timestamp: Date.now() - 120000 },
            { id: '2', mode: "Sign Language", text: "Thank you", time: "15 min ago", timestamp: Date.now() - 900000 },
            { id: '3', mode: "Morse Code", text: "SOS", time: "1 hour ago", timestamp: Date.now() - 3600000 },
            { id: '4', mode: "Lip Reading", text: "Good morning", time: "3 hours ago", timestamp: Date.now() - 10800000 },
            { id: '5', mode: "Sign Language", text: "Help", time: "5 hours ago", timestamp: Date.now() - 18000000 },
          ];
          setRecentActivity(demoActivity);
          localStorage.setItem('mmacs-activity', JSON.stringify(demoActivity));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statsCards = [
    { 
      label: "Total Translations", 
      value: stats.totalTranslations.toLocaleString(), 
      icon: Activity, 
      change: `+${stats.weeklyChange}%`,
      description: "from last week"
    },
    { 
      label: "Sign Language", 
      value: stats.signLanguageCount.toLocaleString(), 
      icon: Hand, 
      color: "text-sign-language",
      onClick: () => navigate('/sign-language')
    },
    { 
      label: "Morse Code", 
      value: stats.morseCodeCount.toLocaleString(), 
      icon: Radio, 
      color: "text-morse-code",
      onClick: () => navigate('/morse-code')
    },
    { 
      label: "Lip Reading", 
      value: stats.lipReadingCount.toLocaleString(), 
      icon: Mic, 
      color: "text-lip-reading",
      onClick: () => navigate('/lip-reading')
    },
  ];

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Sign Language': return <Hand className="h-4 w-4 text-sign-language" />;
      case 'Morse Code': return <Radio className="h-4 w-4 text-morse-code" />;
      case 'Lip Reading': return <Mic className="h-4 w-4 text-lip-reading" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96 mb-8"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your communication sessions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat) => (
          <Card 
            key={stat.label} 
            className={`transition-all hover:shadow-md ${stat.onClick ? 'cursor-pointer' : ''}`}
            onClick={stat.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color || "text-muted-foreground"}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setRecentActivity([])}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      {getModeIcon(item.mode)}
                      <div>
                        <span className="text-sm font-medium">{item.mode}</span>
                        <p className="text-sm text-muted-foreground">"{item.text}"</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(item.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <CardTitle className="text-base">Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sign Language</span>
                  <span className="font-medium">{Math.round((stats.signLanguageCount / stats.totalTranslations) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-sign-language h-2 rounded-full transition-all" 
                    style={{ width: `${(stats.signLanguageCount / stats.totalTranslations) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Morse Code</span>
                  <span className="font-medium">{Math.round((stats.morseCodeCount / stats.totalTranslations) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-morse-code h-2 rounded-full transition-all" 
                    style={{ width: `${(stats.morseCodeCount / stats.totalTranslations) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Lip Reading</span>
                  <span className="font-medium">{Math.round((stats.lipReadingCount / stats.totalTranslations) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-lip-reading h-2 rounded-full transition-all" 
                    style={{ width: `${(stats.lipReadingCount / stats.totalTranslations) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
