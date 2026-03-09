"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Calendar, Clock, Users, Star } from "lucide-react";

const mockTours = [
  {
    id: "1",
    name: "Organic Farm Tour",
    date: "2025-02-15",
    time: "09:00 AM",
    guests: 2,
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop",
    rating: null,
  },
  {
    id: "2",
    name: "Beekeeping Experience",
    date: "2024-12-10",
    time: "10:00 AM",
    guests: 4,
    status: "completed",
    image:
      "https://images.unsplash.com/photo-1587537492373-da937c39e5a1?w=500&h=300&fit=crop",
    rating: 5,
  },
  {
    id: "3",
    name: "Coffee Plantation Visit",
    date: "2025-03-20",
    time: "08:00 AM",
    guests: 3,
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1604081088591-cb13db9d3eae?w=500&h=300&fit=crop",
    rating: null,
  },
];

const statusConfig: Record<
  string,
  { label: string; className: string; textColor: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/10 border-blue-500/20",
    textColor: "text-blue-600",
  },
  completed: {
    label: "Completed",
    className: "bg-primary/10 border-primary/20",
    textColor: "text-primary",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/10 border-destructive/20",
    textColor: "text-destructive",
  },
};

export default function MyTours() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
        <Map className="h-5 w-5 text-primary" />
        My Tours
      </h2>

      <div className="space-y-3">
        {mockTours.map((tour) => (
          <Card
            key={tour.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground">
                        {tour.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          statusConfig[tour.status]?.className
                        } ${statusConfig[tour.status]?.textColor}`}
                      >
                        {statusConfig[tour.status]?.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {tour.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tour.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {tour.guests} guests
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {tour.rating ? (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: tour.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-secondary text-secondary"
                          />
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-1.5">
                      {tour.status === "completed" && !tour.rating && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Leave Review
                        </Button>
                      )}
                      {tour.status === "upcoming" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        View Details
                      </Button>
                    </div>
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
