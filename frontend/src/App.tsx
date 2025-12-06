import React from "react";
import IPhoneSe from "./imports/IPhoneSe2";
import { WebSocketProvider } from "./contexts/WebSocketContext";

export default function App() {
  return (
    <WebSocketProvider>
      <IPhoneSe />
    </WebSocketProvider>
  );
}
