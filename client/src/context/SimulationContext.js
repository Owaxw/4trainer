import React, { createContext, useState } from 'react';
import { 
  getPhishingScenarios, 
  getPasswordScenarios, 
  getSocialScenarios,
  submitPhishingResponse,
  submitPasswordResponse,
  submitSocialResponse
} from '../services/simulationService';

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    phishing: { completed: 0, total: 0 },
    password: { completed: 0, total: 0 },
    social: { completed: 0, total: 0 }
  });

  const loadScenarios = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      switch (type) {
        case 'phishing':
          data = await getPhishingScenarios();
          break;
        case 'password':
          data = await getPasswordScenarios();
          break;
        case 'social':
          data = await getSocialScenarios();
          break;
        default:
          setError('Invalid simulation type');
          return;
      }
      
      setScenarios(data);
      setCurrentScenario(data.length > 0 ? data[0] : null);
      
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (type, scenarioId, response) => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      switch (type) {
        case 'phishing':
          result = await submitPhishingResponse(scenarioId, response);
          break;
        case 'password':
          result = await submitPasswordResponse(scenarioId, response);
          break;
        case 'social':
          result = await submitSocialResponse(scenarioId, response);
          break;
        default:
          setError('Invalid simulation type');
          return;
      }
      
      // Update progress
      setProgress(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          completed: prev[type].completed + 1
        }
      }));
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const nextScenario = () => {
    if (!currentScenario) return null;
    
    const currentIndex = scenarios.findIndex(s => s.id === currentScenario.id);
    if (currentIndex < scenarios.length - 1) {
      setCurrentScenario(scenarios[currentIndex + 1]);
      return scenarios[currentIndex + 1];
    } else {
      setCurrentScenario(null);
      return null;
    }
  };

  const value = {
    scenarios,
    currentScenario,
    loading,
    error,
    progress,
    loadScenarios,
    submitResponse,
    nextScenario
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};