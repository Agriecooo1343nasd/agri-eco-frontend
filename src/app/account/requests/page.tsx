"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";

const mockRequests = [
  {
    id: "1",
    type: "School Visit",
    subject: "Grade 5 Farm Tour Request",
    date: "2025-01-20",
    status: "pending",
    message: "We'd like to schedule a visit for 30 students...",
  },
  {
    id: "2",
    type: "Custom Order",
    subject: "Bulk honey order for event",
    date: "2025-01-15",
    status: "approved",
    message: "Need 50 jars of organic honey for our conference...",
  },
  {
    id: "3",
    type: "Partnership",
    subject: "Artisan collaboration proposal",
    date: "2024-12-28",
    status: "rejected",
    message: "I'd like to sell my handmade baskets...",
  },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  approved: <CheckCircle className="h-3.5 w-3.5 text-primary" />,
  rejected: <XCircle className="h-3.5 w-3.5 text-destructive" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Requests() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        My Requests
      </h2>

      <div className="space-y-3">
        {mockRequests.map((req) => (
          <Card key={req.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{statusIcons[req.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-foreground">
                      {req.subject}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusColors[req.status]}`}
                    >
                      {req.status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {req.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {req.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {req.date}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
