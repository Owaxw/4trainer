import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';

// Pages
import Dashboard from './pages/Dashboard';
import PhishingSimulation from './pages/PhishingSimulation';
import PasswordAttack from './pages/PasswordAttack';
import SocialEngineering from './pages/SocialEngineering';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';

const App = () => {
  return (
    <AuthProvider>
      <SimulationProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
                <PrivateRoute exact path="/simulations/phishing" component={PhishingSimulation} />
                <PrivateRoute exact path="/simulations/password" component={PasswordAttack} />
                <PrivateRoute exact path="/simulations/social" component={SocialEngineering} />
                <PrivateRoute exact path="/reports" component={Reports} />
                <Redirect from="/" to="/dashboard" />
              </Switch>
            </div>
          </div>
        </Router>
      </SimulationProvider>
    </AuthProvider>
  );
};

export default App;