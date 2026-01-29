import { useMemo } from 'react';

export default function FlowBackground() {
    const paths = useMemo(() => {
        // Generate organic curves for "air flow" effect
        return Array.from({ length: 20 }).map((_, i) => (
            <path
                key={i}
                d={`M${-100 + i * 100} ${100 + i * 20} Q ${500 + i * 50} ${-200 + i * 100} ${1500 + i * 20} ${800 + i * 30} T ${2500} ${200 + i * 50}`}
                stroke="url(#flow-gradient)"
                strokeWidth={2 + i * 0.3}
                fill="none"
                className="opacity-40 animate-pulse"
                style={{
                    animationDuration: `${3 + i * 0.5}s`,
                    animationDelay: `${i * 0.2}s`
                }}
            />
        ));
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <svg className="absolute w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                    </linearGradient>
                </defs>
                <g className="opacity-60 dark:opacity-40">
                    {paths}
                </g>
            </svg>
        </div>
    );
}
