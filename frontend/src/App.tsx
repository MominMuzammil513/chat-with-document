"use client"; // Ensure this is a Client Component
import "./App.css";
import Chat from "./components/chat/chat";
import Provider from "./Providers/Provider";

function App() {
  return (
    <Provider>
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 overflow-hidden py-1 sm:py-6">
          <div className="relative px-1 sm:px-6 lg:px-8 max-w-7xl mx-auto h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
            <div className="relative h-full">
              <Chat />
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
}

export default App;
