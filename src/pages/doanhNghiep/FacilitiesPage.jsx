import React from 'react';
import BusinessDashboard from './BusinessDashboard';

export default function FacilitiesPage() {
  // BusinessDashboard already renders BusinessLayout internally; avoid double navbar
  return <BusinessDashboard />;
}


