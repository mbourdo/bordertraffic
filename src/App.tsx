import React, { useEffect, useState } from "react";

interface VehicleWaitTimes {
  [bridge: string]: string;
}

interface DirectionData {
  [vehicleType: string]: VehicleWaitTimes;
}

interface WaitTimesData {
  timestamp: string;
  to_usa: DirectionData;
  to_canada: DirectionData;
}

const App: React.FC = () => {
  const [data, setData] = useState<WaitTimesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Attempting to fetch waitTimes.json...");
        
        // Use relative path that works with your base path
        const res = await fetch("./waitTimes.json");
        console.log("Response status:", res.status);
        console.log("Response ok:", res.ok);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        console.log("Successfully fetched data:", json);
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatBridgeName = (bridge: string): string => {
    const nameMap: { [key: string]: string } = {
      "lewistonqueenston": "Lewiston-Queenston",
      "rainbow": "Rainbow Bridge",
      "whirlpool**(nexus only)": "Whirlpool Rapids",
      "whirlpool": "Whirlpool Rapids",
      "peacebridge": "Peace Bridge"
    };
    return nameMap[bridge.toLowerCase()] || bridge;
  };

  const formatWaitTime = (time: string): string => {
    if (!time || time === "N/A" || time === "") return "N/A";
    return time;
  };

  const getWaitTimeColor = (time: string): string => {
    if (!time || time === "N/A" || time === "") return "#e5e7eb"; // Gray for N/A
    if (time.toLowerCase().includes("no delay")) return "#22c55e"; // Green for no delay
    return "#ef4444"; // Red for any wait time
  };

  const renderTable = (direction: "to_usa" | "to_canada", title: string) => {
    if (!data || !data[direction]) return null;

    const directionData = data[direction];
    const vehicleTypes = Object.keys(directionData);
    const bridges = new Set<string>();
    
    // Collect all unique bridge names, excluding whirlpool rapids
    vehicleTypes.forEach(vehicleType => {
      Object.keys(directionData[vehicleType] || {}).forEach(bridge => {
        const bridgeName = bridge.toLowerCase();
        if (!bridgeName.includes("whirlpool")) {
          bridges.add(bridge);
        }
      });
    });

    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">{title}</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-purple-100">
          <table className="w-full min-w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-purple-100">
                  Bridge
                </th>
                {vehicleTypes.map((vehicleType) => (
                  <th key={vehicleType} className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-b border-purple-100">
                    {vehicleType}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(bridges).map((bridge, index) => (
                <tr key={bridge} className={index % 2 === 0 ? "bg-blue-25" : "bg-green-25"}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100">
                    {formatBridgeName(bridge)}
                  </td>
                  {vehicleTypes.map((vehicleType) => {
                    const waitTime = directionData[vehicleType]?.[bridge] || "N/A";
                    const color = getWaitTimeColor(waitTime);
                    
                    return (
                      <td key={vehicleType} className="px-4 py-3 text-center border-b border-gray-100">
                        <div 
                          className="inline-block px-3 py-2 rounded text-sm font-medium text-white shadow-sm min-w-16"
                          style={{ backgroundColor: color }}
                        >
                          {formatWaitTime(waitTime)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading border wait times...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold mb-2">Error Loading Data</h2>
          <p className="text-red-700 text-sm">{error}</p>
          <p className="text-red-600 text-xs mt-2">
            Make sure waitTimes.json exists in the public folder and your Python scraper is running.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-purple-800">Niagara Border Wait Times</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-6xl mx-auto">
        {renderTable("to_canada", "USA to Canada")}
        {renderTable("to_usa", "Canada to USA")}
        
        {/* Footer */}
        <div className="text-center text-sm text-purple-400 mt-8 pb-4">
          Data sourced from Niagara Falls Bridges
        </div>
      </main>
    </div>
  );
};

export default App;