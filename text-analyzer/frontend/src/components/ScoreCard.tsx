interface ScoreCardProps {
    scores: {
        structure: number;
        technical: number;
        coherence: number;
    };
}

export default function ScoreCard({ scores }: ScoreCardProps) {
    const getScoreColor = (score: number, target: number) => {
        if (score >= target) return 'bg-green-500';
        if (score >= target * 0.8) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {[
                { name: 'Structure', score: scores.structure, target: 85 },
                { name: 'Technical', score: scores.technical, target: 70 },
                { name: 'Coherence', score: scores.coherence, target: 80 },
            ].map(({ name, score, target }) => (
                <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-900 font-medium font-mono">
                        <span>{name} (Target: {target}%)</span>
                        <span>{score.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${getScoreColor(score, target)}`}
                            style={{ width: `${Math.min(100, score)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}