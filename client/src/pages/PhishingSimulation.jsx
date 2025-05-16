import React, { useState, useEffect, useContext } from 'react';
import { SimulationContext } from '../context/SimulationContext';

const PhishingSimulation = () => {
  const { 
    loading, 
    currentScenario, 
    scenarios, 
    loadScenarios, 
    submitResponse, 
    nextScenario 
  } = useContext(SimulationContext);
  
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadScenarios('phishing');
  }, []);

  const handleResponseSubmit = async (action) => {
    try {
      const response = await submitResponse('phishing', currentScenario.id, action);
      setFeedback(response.feedback);
      
      // Move to next scenario after a delay
      setTimeout(() => {
        nextScenario();
        setFeedback(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  if (loading && !currentScenario) {
    return <div className="text-center py-8">Loading scenarios...</div>;
  }

  if (!currentScenario && !loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Simulation Complete</h2>
        <p className="mb-4">You have completed all phishing scenarios. Check your results in the Reports section.</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => window.location.href = '/reports'}
        >
          View Reports
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Phishing Attack Simulation</h1>
      
      {currentScenario && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">{currentScenario.title}</h2>
          
          <div className="border border-gray-300 p-4 rounded mb-4">
            <div className="border-b border-gray-300 pb-2 mb-2">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">From:</span> {currentScenario.email.from}
                </div>
                <div>
                  <span className="font-semibold">Date:</span> {currentScenario.email.date}
                </div>
              </div>
              <div>
                <span className="font-semibold">To:</span> {currentScenario.email.to}
              </div>
              <div>
                <span className="font-semibold">Subject:</span> {currentScenario.email.subject}
              </div>
            </div>
            
            <div dangerouslySetInnerHTML={{ __html: currentScenario.email.body }} />
            
            {currentScenario.email.attachments && currentScenario.email.attachments.length > 0 && (
              <div className="mt-4 pt-2 border-t border-gray-300">
                <div className="font-semibold mb-2">Attachments:</div>
                <ul>
                  {currentScenario.email.attachments.map((attachment, index) => (
                    <li key={index} className="flex items-center mb-1">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                      {attachment.filename}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <p className="font-semibold mb-2">How would you respond to this email?</p>
            <div className="flex flex-wrap gap-2">
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => handleResponseSubmit('safe')}
                disabled={loading}
              >
                Safe - Open/Respond
              </button>
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={() => handleResponseSubmit('suspicious')}
                disabled={loading}
              >
                Suspicious - Verify First
              </button>
              <button 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => handleResponseSubmit('phishing')}
                disabled={loading}
              >
                Phishing - Report/Delete
              </button>
            </div>
          </div>
          
          {feedback && (
            <div className={`p-4 rounded ${
              feedback.correct ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
            }`}>
              <h3 className="font-bold mb-2">{feedback.correct ? 'Correct!' : 'Incorrect'}</h3>
              <p>{feedback.message}</p>
              {feedback.indicators && (
                <div className="mt-2">
                  <p className="font-semibold">Warning signs to look for:</p>
                  <ul className="list-disc pl-5">
                    {feedback.indicators.map((indicator, index) => (
                      <li key={index}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded">
        <div>
          {currentScenario && (
            <span>Scenario {scenarios.findIndex(s => s.id === currentScenario.id) + 1} of {scenarios.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhishingSimulation;