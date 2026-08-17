'use client';

import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import RevenueAnalyticsPanel from '@/components/dashboard/RevenueAnalyticsPanel';

export default function RevenueAnalyticsPage() {
  return (
    <TutorDashboardLayout title="Revenue Analytics" subtitle="Track your income and outcome on Mentora.lk.">
      <RevenueAnalyticsPanel />
    </TutorDashboardLayout>
  );
}
