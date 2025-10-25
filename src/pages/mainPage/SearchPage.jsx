import React from 'react';
import SearchFacilities from '../../components/SearchFacilities';
import ManagerBar from '../../components/ManagerBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';

export default function SearchPage() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Manager Bar */}
      <ManagerBar 
        isLoggedIn={isLoggedIn}
        userName={user?.name}
        userAvatar={user?.avatar}
        onLogout={logout}
      />

      {/* Search Facilities Section */}
      <SearchFacilities />

      {/* Footer */}
      <Footer />
    </div>
  );
}
