import { useState, useEffect } from 'react';

const useWebSocket = (workspaceId: string | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (workspaceId) {
      const newSocket = new WebSocket(`ws://localhost:8000/ws/${workspaceId}`);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Handle WebSocket message here
        console.log('Received message:', data);
      };

      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      setSocket(newSocket);

      return () => {
        if (socket) {
          socket.close();
        }
        newSocket.close();
      };
    }
  }, [workspaceId, socket]);

  return socket;
};

export default useWebSocket;