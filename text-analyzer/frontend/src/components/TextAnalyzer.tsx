'use client';

import React, { useState } from 'react';
import ScoreCard from './ScoreCard';
import Suggestions from './Suggestions';
import { analyzeText } from '@/lib/api';

interface AnalysisResult {
    scores: {
        structure: number;
        technical: number;
        coherence: number;
    };
    suggestions: string[];
}

export default function TextAnalyzer() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await analyzeText(text);
            setResults(data);
        } catch (err) {
            setError('Failed to analyze text. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border-2 border-black">
            <div className="p-8 border-b-2 border-black">
                <h1 className="text-2xl font-bold text-gray-900 font-center">Orwell: Analyze your technical writing</h1>
            </div>
            <div className="p-8 space-y-6 text-black">
                <textarea
                    placeholder="Enter your technical text here..."
                    className="w-full h-48 p-4 border-2 border-black rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <button
                    onClick={handleAnalyze}
                    disabled={!text.trim() || loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium active:scale-95 transition
            ${!text.trim() || loading
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-900'}`}
                >
                    {loading ? 'Analyzing...' : 'Analyze Text'}
                </button>

                {error && (
                    <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                {results && (
                    <div className="space-y-6">
                        <ScoreCard scores={results.scores} />
                        <Suggestions suggestions={results.suggestions} />
                    </div>
                )}
            </div>
        </div>
    );
}