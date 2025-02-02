interface SuggestionsProps {
    suggestions: string[];
}

export default function Suggestions({ suggestions }: SuggestionsProps) {
    if (!suggestions.length) return null;

    return (
        <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
                <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <h3 className="font-semibold text-gray-800 font-mono text-sm">Suggestions for Improvement</h3>
            </div>
            <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 text-gray-700 font-mono text-sm">
                        <span className="text-black">•</span>
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
}