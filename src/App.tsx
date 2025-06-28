import { useEffect, useState } from "react";

interface WaitTimes {
  [bridge: string]: {
    autos?: string;
    trucks?: string;
    nexus?: string;
  };
}

function transformData(rawData: any): { to_usa: WaitTimes; to_canada: WaitTimes } {
  const transformDirection = (direction: any) => {
    const output: WaitTimes = {};
    const vehicleTypes = Object.keys(direction); // Autos, Trucks, Nexus

    for (const vehicleType of vehicleTypes) {
      const bridges = direction[vehicleType];
      for (const bridge in bridges) {
        const normalizedBridge = bridge.toLowerCase();
        if (!output[normalizedBridge]) output[normalizedBridge] = {};
        output[normalizedBridge][vehicleType.toLowerCase()] = bridges[bridge];
      }
    }

    return output;
  };

  return {
    to_usa: transformDirection(rawData.to_usa),
    to_canada: transformDirection(rawData.to_canada),
  };
}

export default function App() {
  const [data, setData] = useState<{ to_usa: WaitTimes; to_canada: WaitTimes } | null>(null);

  useEffect(() => {
    fetch("/waitTimes.json")
      .then((res) => res.json())
      .then((rawData) => setData(transformData(rawData)))
      .catch((err) => console.error("Failed to load data", err));
  }, []);

  const vehicleTypes = ["autos", "trucks", "nexus"];

  const renderTable = (title: string, bridgeData: WaitTimes) => {
    const bridges = Object.keys(bridgeData);

    return (
      <div className="table-container">
        <h2>{title}</h2>
        <table>
          <thead>
            <tr>
              <th>Bridge</th>
              {vehicleTypes.map((type) => (
                <th key={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bridges.map((bridge) => (
              <tr key={bridge}>
                <td>{bridge}</td>
                {vehicleTypes.map((type) => (
                  <td key={type}>{bridgeData[bridge]?.[type] || "N/A"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
      <h1>Border Wait Times</h1>
      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          {renderTable("To USA", data.to_usa)}
          {renderTable("To Canada", data.to_canada)}
        </>
      )}
    </main>
  );
}
