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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">TraceNet</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze"
          rows="6"
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {results && (
        <div className="mt-8 w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
      {/*Map display done here*/}
      {results && results.graph && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Knowledge Graph</h3>
          <GraphVisualization graphData={results.graph} />
        </div>
      )}
    </div>
  );
}