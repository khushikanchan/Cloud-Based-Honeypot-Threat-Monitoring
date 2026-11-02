import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Zap,
  Activity,
  Globe,
  ScanSearch,
  BarChart3,
  Server,
  Shield,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import LiveThreats from "./pages/LiveThreats";
import Events from "./pages/Events";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import PortScans from "./pages/PortScans";
import Analytics from "./pages/Analytics";
import Honeypots from "./pages/Honeypots";

import AlertPanel from "./components/AlertPanel";

import "./App.css";


// ==========================================================
// SIDEBAR
// ==========================================================

function Sidebar() {

  return (
    <aside className="sidebar">

      {/* ------------------------------------------------ */}
      {/* LOGO */}
      {/* ------------------------------------------------ */}

      <div className="logo">

        <div className="logo-icon">
          <Shield size={21} />
        </div>

        <div className="logo-text">

          <strong>
            HONEY<span>POT</span>
          </strong>

          <small>
            SOC MONITOR
          </small>

        </div>

      </div>


      {/* ------------------------------------------------ */}
      {/* NAVIGATION */}
      {/* ------------------------------------------------ */}

      <nav>

        {/* Monitoring */}

        <div className="nav-section">
          MONITORING
        </div>


        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <LayoutDashboard size={16} />

          <span>
            Dashboard
          </span>

        </NavLink>


        <NavLink
          to="/live-threats"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <Zap size={16} />

          <span>
            Live Threats
          </span>

        </NavLink>


        <NavLink
          to="/events"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <Activity size={16} />

          <span>
            Events
          </span>

        </NavLink>


        {/* Intelligence */}

        <div className="nav-section">
          INTELLIGENCE
        </div>


        <NavLink
          to="/threat-intelligence"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <Globe size={16} />

          <span>
            Threat Intelligence
          </span>

        </NavLink>


        <NavLink
          to="/port-scans"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <ScanSearch size={16} />

          <span>
            Port Scans
          </span>

        </NavLink>


        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <BarChart3 size={16} />

          <span>
            Analytics
          </span>

        </NavLink>


        {/* Services */}

        <div className="nav-section">
          SERVICES
        </div>


        <NavLink
          to="/honeypots"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >

          <Server size={16} />

          <span>
            Honeypots
          </span>

        </NavLink>

      </nav>


      {/* ------------------------------------------------ */}
      {/* SYSTEM STATUS */}
      {/* ------------------------------------------------ */}

      <div className="system-status">

        <div className="status-dot"></div>

        <div>

          <strong>
            System Operational
          </strong>

          <small>
            All services monitored
          </small>

        </div>

      </div>

    </aside>
  );
}


// ==========================================================
// APPLICATION
// ==========================================================

function App() {

  return (

    <BrowserRouter>

      <div className="app">

        {/* SIDEBAR */}

        <Sidebar />


        {/* MAIN CONTENT */}

        <main className="main-content">

          {/* REAL-TIME ALERTS */}

          <AlertPanel />


          {/* ROUTES */}

          <Routes>

            {/* Default */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />


            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* Live Threats */}

            <Route
              path="/live-threats"
              element={<LiveThreats />}
            />


            {/* Events */}

            <Route
              path="/events"
              element={<Events />}
            />


            {/* Threat Intelligence */}

            <Route
              path="/threat-intelligence"
              element={<ThreatIntelligence />}
            />


            {/* Port Scans */}

            <Route
              path="/port-scans"
              element={<PortScans />}
            />


            {/* Analytics */}

            <Route
              path="/analytics"
              element={<Analytics />}
            />


            {/* Honeypots */}

            <Route
              path="/honeypots"
              element={<Honeypots />}
            />


            {/* Unknown URL */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>

  );
}


export default App;