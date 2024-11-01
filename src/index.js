import React from 'react';
import ReactDOM from 'react-dom';
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

ReactDOM.render(
  <React.StrictMode>
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
        <Route path="/profile/:id" element={<ProfileView />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);