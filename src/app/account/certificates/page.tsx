"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, Calendar } from "lucide-react";

const mockCertificates = [
  {
    id: "1",
    title: "Beekeeping Masterclass",
    issueDate: "2024-12-20",
    instructor: "Prof. Ndayisaba",
    credentialId: "CERT-BK-2024-001",
  },
  {
    id: "2",
    title: "Organic Soil Management",
    issueDate: "2024-09-15",
    instructor: "Dr. Uwimana",
    credentialId: "CERT-OS-2024-012",
  },
];

export default function Certificates() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        My Certificates
      </h2>

      {mockCertificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No certificates yet. Complete a course to earn one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {mockCertificates.map((cert) => (
            <Card
              key={cert.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                {/* Certificate visual */}
                <div
                  className="bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 p-6 text-center border-b border-border relative"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                  }}
                >
                  <Award className="h-10 w-10 text-primary mx-auto mb-2" />
                  <h3 className="font-bold font-heading text-foreground text-sm">
                    {cert.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {cert.credentialId}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Instructor:{" "}
                      <span className="text-foreground font-medium">
                        {cert.instructor}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {cert.issueDate}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Share
                    </Button>
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
