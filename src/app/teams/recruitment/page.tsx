"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, Trophy, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ApplicationDialog } from "./ApplicationDialog";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
<<<<<<< HEAD
=======
import { Application, RecruitmentItem } from "@/types/application";
>>>>>>> 6e5b227c19f69feb43ebe009347863fd398c2203

export default function RecruiterHubPage() {
  return (
    <ProtectedRoute allowedTypes={["team"]}>
      <RecruiterHub />
    </ProtectedRoute>
  );
}

function RecruiterHub() {
<<<<<<< HEAD
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const recruitmentItems = [
=======
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const recruitmentItems: RecruitmentItem[] = [
>>>>>>> 6e5b227c19f69feb43ebe009347863fd398c2203
    {
      title: "Open Positions",
      count: 12,
      icon: Users,
      description: "Active job postings"
    },
    {
      title: "Applications",
      count: 45,
      icon: Trophy,
      description: "Total applications received"
    },
    {
      title: "In Process",
      count: 8,
      icon: Calendar,
      description: "Candidates in selection"
    }
  ];

  const recentApplications = [
    {
      name: "John Smith",
      position: "Point Guard",
      team: "Chicago Bulls",
      status: "Under Review",
      appliedOn: "2025-06-01"
    },
    {
      name: "Sarah Johnson",
      position: "Forward",
      team: "LA Lakers",
      status: "Interview Scheduled",
      appliedOn: "2025-06-02"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recruiter Hub</h1>
        <p className="text-gray-600">Manage your team&apos;s recruitment process</p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search applications, positions..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {recruitmentItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((application, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium">{application.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{application.position}</span>
                      <span>•</span>
                      <span>{application.team}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{application.status}</Badge>                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedApplication({
                        id: index.toString(),
                        ...application,
                        contact: {
                          email: "applicant@example.com",
                          phone: "+1 234 567 8900"
                        },
                        experience: "5 years of professional basketball experience",
                        achievements: [
                          "3x All-Star Team Selection",
                          "League MVP 2024",
                          "Scoring Leader 2023"
                        ]
                      });
                      setDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedApplication && (
        <ApplicationDialog
          isOpen={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          onUpdateStatus={async (id, newStatus, feedback) => {
            console.log("Updating status:", { id, newStatus, feedback });
            // TODO: Implement actual status update logic
            // await updateApplicationStatus(id, newStatus, feedback);
          }}
        />
      )}
    </div>
  );
}