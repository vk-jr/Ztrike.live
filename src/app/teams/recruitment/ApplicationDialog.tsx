"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    name: string;
    position: string;
    team: string;
    status: string;
<<<<<<< HEAD
    appliedOn: Date | { toDate(): Date };
=======
    appliedOn: string;
>>>>>>> 6e5b227c19f69feb43ebe009347863fd398c2203
    experience?: string;
    achievements?: string[];
    contact?: {
      email: string;
      phone?: string;
    };
  };
  onUpdateStatus: (id: string, newStatus: string, feedback?: string) => void;
}

export function ApplicationDialog({
  isOpen,
  onClose,
  application,
  onUpdateStatus,
}: ApplicationDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      await onUpdateStatus(application.id, newStatus, feedback);
      onClose();
    } catch (error) {
      console.error("Error updating application status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Review and manage candidate application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Applicant Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{application.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{application.position}</span>
              <span>•</span>
              <span>{application.team}</span>
              <span>•</span>
<<<<<<< HEAD
              {application.appliedOn && (
                <p className="text-sm text-gray-500">
                  <span>Applied on {
                    application.appliedOn instanceof Date
                      ? application.appliedOn.toLocaleDateString()
                      : (application.appliedOn as any)?.toDate().toLocaleDateString()
                  }</span>
                </p>
              )}
=======
              <span>Applied on {new Date(application.appliedOn).toLocaleDateString()}</span>
>>>>>>> 6e5b227c19f69feb43ebe009347863fd398c2203
            </div>
          </div>

          {/* Current Status */}
          <div>
            <label className="text-sm font-medium text-gray-700">Current Status</label>
            <div className="mt-1">
              <Badge variant="secondary">{application.status}</Badge>
            </div>
          </div>

          {/* Contact Information */}
          {application.contact && (
            <div>
              <label className="text-sm font-medium text-gray-700">Contact Information</label>
              <div className="mt-1 space-y-1 text-sm text-gray-600">
                <div>Email: {application.contact.email}</div>
                {application.contact.phone && (
                  <div>Phone: {application.contact.phone}</div>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {application.experience && (
            <div>
              <label className="text-sm font-medium text-gray-700">Experience</label>
              <p className="mt-1 text-sm text-gray-600">{application.experience}</p>
            </div>
          )}

          {/* Achievements */}
          {application.achievements && application.achievements.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Achievements</label>
              <ul className="mt-1 space-y-1">
                {application.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div>
            <label className="text-sm font-medium text-gray-700">Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add notes or feedback about the application..."
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("Rejected")}
              disabled={loading}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleStatusUpdate("Approved")}
              disabled={loading}
            >
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}