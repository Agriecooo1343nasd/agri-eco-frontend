"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle, XCircle, Inbox } from "lucide-react";
import { fetchMyRequests, type UserRequest } from "@/lib/api/user";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  approved: <CheckCircle className="h-3.5 w-3.5 text-primary" />,
  rejected: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  completed: <CheckCircle className="h-3.5 w-3.5 text-blue-500" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export default function Requests() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const response = await fetchMyRequests();
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {t(translations.requestsPage.myRequests)}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        {t(translations.requestsPage.myRequests)}
      </h2>

      {requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">{t(translations.requestsPage.noRequestsFound)}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {t(translations.requestsPage.requestsDescription)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusIcons[req.status.toLowerCase()] || statusIcons.pending}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">
                        {req.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize transition-colors ${
                          statusColors[req.status.toLowerCase()] || statusColors.pending
                        }`}
                      >
                        {t((translations.statuses as any)[req.status.toLowerCase()] || req.status)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {req.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                      {format(new Date(req.createdAt), "PPP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
