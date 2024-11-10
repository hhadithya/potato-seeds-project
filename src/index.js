import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import './index.css';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import ProtectedRoute from './ProtectedRoute';
import ProfileList from './pages/ProfileList';
import HarvestDetails from './pages/HarvestDetails';
import AddHarvest from './pages/AddHarvest';
import ProfileView from './views/ProfileView';
import HarvestOut from './pages/HarvestOut';
import { UserProvider } from './context/UserContext';

const rootElement = document.getElementById('root');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profiles" element={<ProfileList />} />
          <Route path="/harvestdetails" element={<HarvestDetails />} />
          <Route path="/addHarvest" element={<AddHarvest />} />
          <Route path="/outHarvest" element={<HarvestOut />} />
          <Route path="/profile/:id" element={<ProfileView />} />
        </Routes>
      </Router>
    </UserProvider>
  </React.StrictMode>
);
