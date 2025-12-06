import React, { useState } from "react";
import IPhoneSe from "./imports/IPhoneSe2";
import { NewDashboard } from "./pages/NewDashboard";
import { WebSocketProvider } from "./contexts/WebSocketContext";

export default function App() {
  // Toggle between old and new UI
  const [useNewUI, setUseNewUI] = useState(true);

  return (
    <WebSocketProvider>
      {/* Toggle Button - Remove this when you're done redesigning */}
      <button
        onClick={() => setUseNewUI(!useNewUI)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '8px 16px',
          backgroundColor: useNewUI ? '#10b981' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        {useNewUI ? '📱 Old UI' : '🎨 New UI'}
      </button>

      {/* Render based on toggle */}
      {useNewUI ? <NewDashboard /> : <IPhoneSe />}
    </WebSocketProvider>
  );
}
