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
  
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers]));
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText || "No error details provided"}`);
      }
  
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      if (!responseText) {
        throw new Error("Server returned an empty response");
      }
      
      const data = JSON.parse(responseText);
      setResults(data);
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans">
      {/* Modern, minimalist header */}
      <header className="border-b border-zinc-800 backdrop-blur-md bg-black/60 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
              <span className="text-black font-bold text-xs">T</span>
            </div>
            <h1 className="text-xl font-light tracking-tight">
              <span className="font-medium">Trace</span>Net
            </h1>
          </div>
          <div className="text-xs text-zinc-400 font-light">Knowledge Analysis Engine</div>
        </div>
      </header>

      {/* Main content with proper spacing */}
      <main className="container mx-auto px-6 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Headline with subtle glow */}
          <h2 className="text-3xl md:text-4xl font-light mb-3 tracking-tight">
            Analyze relationships in<br />
            <span className="bg-gradient-to-r from-emerald-300 to-blue-400 bg-clip-text text-transparent font-medium">complex text content</span>
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mb-10 max-w-2xl">
            TraceNet parses text to identify entities and their relationships, generating knowledge graphs to visualize complex information networks.
          </p>

          {/* Input section with sleek design */}
          <div className="mb-12">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to analyze relationships between entities..."
                  rows="6"
                  className="relative w-full p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-zinc-200 placeholder-zinc-500 transition duration-200 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="relative px-6 py-3 overflow-hidden bg-black border border-zinc-800 rounded-lg group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-zinc-900/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-emerald-500/10 rounded-full group-hover:w-80 group-hover:h-80 opacity-10"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Analyze</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Error message with subtle styling */}
          {error && (
            <div className="mb-8 p-4 border border-red-900/50 bg-red-950/20 rounded-lg text-red-300 text-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-red-400">Error Processing Text</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results section with futuristic glass morphism */}
          {results && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-light flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Analysis Results
              </h3>
              
              {/* Entities section */}
              {results.entities && Object.keys(results.entities).length > 0 && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl blur opacity-30 transition duration-1000"></div>
                  <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl">
                    <h4 className="text-sm uppercase tracking-wider text-zinc-400 mb-4 font-medium">Entities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(results.entities).map(([type, entities]) => (
                        <div key={type} className="space-y-2">
                          <div className="text-xs text-zinc-400 uppercase tracking-wider">{type}</div>
                          <div className="flex flex-wrap gap-2">
                            {entities.map((entity, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-emerald-300 border border-zinc-700"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Relationships section */}
              {results.relationships && results.relationships.length > 0 && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-xl blur opacity-30 transition duration-1000"></div>
                  <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl">
                    <h4 className="text-sm uppercase tracking-wider text-zinc-400 mb-4 font-medium">Relationships</h4>
                    <div className="space-y-3">
                      {results.relationships.map((rel, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <span className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-blue-300 border border-zinc-700">
                            {rel[0]}
                          </span>
                          <div className="mx-2 text-zinc-500 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-emerald-300 border border-zinc-700">
                            {rel[1]}
                          </span>
                          <div className="mx-2 text-zinc-500 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-blue-300 border border-zinc-700">
                            {rel[2]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Knowledge Graph */}
              {results.graph && (
                <div className="mt-8 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl blur opacity-30 transition duration-1000"></div>
                  <div className="relative p-5 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl">
                    <h4 className="text-sm uppercase tracking-wider text-zinc-400 mb-4 font-medium">Knowledge Graph</h4>
                    <div className="h-[500px] bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                      <GraphVisualization graphData={results.graph} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Minimalist footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-black/60 backdrop-blur-md py-3 z-40">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-xs text-zinc-500">
            TraceNet - Rithvik Dirisala
          </div>
          <div className="text-xs text-zinc-500">
            Knowledge Analysis Engine
          </div>
        </div>
      </footer>
    </div>
  );
}