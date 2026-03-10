"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Award } from "lucide-react";

const mockEnrollments = [
  {
    id: "1",
    title: "Organic Farming Fundamentals",
    progress: 75,
    modules: 8,
    completed: 6,
    status: "in-progress",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop",
    instructor: "Dr. Uwimana",
    startDate: "2025-01-10",
  },
  {
    id: "2",
    title: "Beekeeping Masterclass",
    progress: 100,
    modules: 5,
    completed: 5,
    status: "completed",
    image:
      "https://images.unsplash.com/photo-1587537492373-da937c39e5a1?w=500&h=300&fit=crop",
    instructor: "Prof. Ndayisaba",
    startDate: "2024-11-05",
  },
  {
    id: "3",
    title: "Sustainable Agriculture Practices",
    progress: 20,
    modules: 10,
    completed: 2,
    status: "in-progress",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop",
    instructor: "Eng. Kagabo",
    startDate: "2025-02-01",
  },
];

const statusConfig: Record<
  string,
  { label: string; className: string; textColor: string }
> = {
  "in-progress": {
    label: "In Progress",
    className: "bg-green-500/10 border-green-500/20",
    textColor: "text-green-600",
  },
  completed: {
    label: "Completed",
    className: "bg-primary/10 border-primary/20",
    textColor: "text-primary",
  },
  expired: {
    label: "Expired",
    className: "bg-destructive/10 border-destructive/20",
    textColor: "text-destructive",
  },
};

export default function Enrollments() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        My Enrollments
      </h2>

      <div className="space-y-3">
        {mockEnrollments.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-44 h-32 sm:h-auto shrink-0 relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {item.progress === 100 && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Award className="h-10 w-10 text-primary-foreground drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            statusConfig[item.status]?.className
                          } ${statusConfig[item.status]?.textColor}`}
                        >
                          {statusConfig[item.status]?.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        by {item.instructor} · Started {item.startDate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {item.completed}/{item.modules} modules
                      </span>
                      <span className="font-medium text-foreground">
                        {item.progress}%
                      </span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-end gap-1.5 mt-3">
                    {item.status === "in-progress" && (
                      <Button size="sm" className="h-7 text-xs gap-1">
                        <BookOpen className="h-3 w-3" />
                        Continue Learning
                      </Button>
                    )}
                    {item.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                      >
                        <Award className="h-3 w-3" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
