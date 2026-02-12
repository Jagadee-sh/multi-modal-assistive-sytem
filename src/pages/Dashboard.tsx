import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand, Radio, Mic, Activity } from "lucide-react";

const statsCards = [
  { label: "Total Translations", value: "1,247", icon: Activity, change: "+12%" },
  { label: "Sign Language", value: "523", icon: Hand, color: "text-sign-language" },
  { label: "Morse Code", value: "489", icon: Radio, color: "text-morse-code" },
  { label: "Lip Reading", value: "235", icon: Mic, color: "text-lip-reading" },
];

const recentActivity = [
  { mode: "Morse Code", text: "HELLO WORLD", time: "2 min ago" },
  { mode: "Sign Language", text: "Thank you", time: "15 min ago" },
  { mode: "Morse Code", text: "SOS", time: "1 hour ago" },
  { mode: "Lip Reading", text: "Good morning", time: "3 hours ago" },
  { mode: "Sign Language", text: "Help", time: "5 hours ago" },
];

const Dashboard = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your communication sessions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color || "text-muted-foreground"}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && <p className="text-xs text-morse-code mt-1">{stat.change} from last week</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <span className="text-sm font-medium">{item.mode}</span>
                  <p className="text-sm text-muted-foreground">"{item.text}"</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
