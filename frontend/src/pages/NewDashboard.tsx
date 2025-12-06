import React from 'react';
import { useWebSocketContext } from '../contexts/WebSocketContext';

export function NewDashboard() {
  // Access WebSocket data from anywhere!
  const { isConnected, partialTranscript, finalTranscripts, error } = useWebSocketContext();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Guardian Dashboard</h1>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Live Transcript (Takes up 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Live Transcript</h2>

            {/* Transcript Container */}
            <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">

              {/* No transcripts yet */}
              {finalTranscripts.length === 0 && !partialTranscript && (
                <p className="text-gray-400 italic">Waiting for call transcription...</p>
              )}

              {/* Final Transcripts */}
              {finalTranscripts.map((transcript, index) => (
                <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-800">{transcript}</p>
                </div>
              ))}

              {/* Partial Transcript (in progress) */}
              {partialTranscript && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-800 italic">
                    {partialTranscript}
                    <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse" />
                  </p>
                </div>
              )}
            </div>

            {/* Transcript Count */}
            <div className="mt-4 text-sm text-gray-500">
              {finalTranscripts.length} {finalTranscripts.length === 1 ? 'message' : 'messages'}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Call Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Call Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <p className="font-medium">Active Call</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Duration:</span>
                  <p className="font-medium">0:00</p>
                </div>
              </div>
            </div>

            {/* Scam Keywords Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Detected Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {/* TODO: Add keyword detection */}
                <span className="text-sm text-gray-400 italic">None detected</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                🛑 Intercept Call
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                ✅ Not a Scam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
