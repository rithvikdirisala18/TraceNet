"use client";

import { useState } from "react";
import GraphVisualization from "../components/GraphVisualization";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/analyze/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">Trace</span>
            <span className="text-blue-200">Net</span>
          </h1>
          <div className="text-sm text-blue-100">Knowledge Graph Analyzer</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">Text Analysis</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to analyze relationships between entities..."
                rows="8"
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400 transition-all duration-200"
              />
              <button
                type="submit"
                className={`mt-4 w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Analyze Text"
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className={`bg-gray-800 rounded-xl p-6 shadow-md transition-all duration-500 ${results ? 'opacity-100' : 'opacity-50'}`}>
            <h2 className="text-xl font-semibold mb-4 text-blue-300">
              {results ? "Analysis Results" : "Waiting for input..."}
            </h2>
            {results ? (
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-300 mb-2">Entities</h3>
                  <div className="space-y-2">
                    {Object.entries(results.entities || {}).map(([type, entities]) => (
                      <div key={type}>
                        <h4 className="text-sm font-medium text-gray-300">{type}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {entities.map((entity, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 text-xs rounded-full bg-blue-600/30 text-blue-200 border border-blue-500/30"
                            >
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-300 mb-2">Relationships</h3>
                  <div className="space-y-2">
                    {(results.relationships || []).map((rel, idx) => (
                      <div key={idx} className="p-2 bg-gray-800 rounded-lg flex items-center">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-600/30 text-green-200 border border-green-500/30">
                          {rel[0]}
                        </span>
                        <span className="mx-2 text-xs text-gray-400 font-mono">→</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-600/30 text-yellow-200 border border-yellow-500/30">
                          {rel[1]}
                        </span>
                        <span className="mx-2 text-xs text-gray-400 font-mono">→</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-600/30 text-green-200 border border-green-500/30">
                          {rel[2]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Enter text to see analysis results</p>
              </div>
            )}
          </div>
        </div>

        {results && results.graph && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">Knowledge Graph</h2>
            <div className="bg-gray-700 rounded-lg p-2 h-[500px]">
              <GraphVisualization graphData={results.graph} />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>TraceNet - Rithvik Dirisala | Knowledge Graph Analysis Tool</p>
        </div>
      </footer>
    </div>
  );
}