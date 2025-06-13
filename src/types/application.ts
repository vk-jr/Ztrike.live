export interface Application {
  id: string;
  name: string;
  position: string;
  team: string;
  status: string;
  appliedOn: Date | { toDate(): Date };
  experience?: string;
  achievements?: string[];
  contact?: {
    email: string;
    phone?: string;
  };
}

export interface RecruitmentItem {
  title: string;
  count: number;
  icon: any; // Lucide icon component type
  description: string;
}
