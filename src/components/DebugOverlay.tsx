import { useState, useEffect } from "react";

export default function DebugOverlay() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Override console.error
        const originalError = console.error;
        console.error = (...args) => {
            setLogs((prev) => [`[ERROR] ${args.join(" ")}`, ...prev].slice(0, 30));
            originalError.apply(console, args);
        };

        // Override console.log
        const originalLog = console.log;
        console.log = (...args) => {
            const msg = args.join(" ");
            if (msg.includes("Kakao") || msg.includes("map") || msg.includes("SDK")) {
                setLogs((prev) => [`[LOG] ${msg}`, ...prev].slice(0, 30));
            }
            originalLog.apply(console, args);
        };

        // Global error handler
        window.onerror = (message, source, lineno) => {
            setLogs((prev) => [`[CRITICAL] ${message} (${source}:${lineno})`, ...prev].slice(0, 30));
        };

        // Initial Status Check
        setTimeout(() => {
            if ((window as any).kakao) {
                setLogs((prev) => [`[STATUS] window.kakao exists`, ...prev]);
                if ((window as any).kakao.maps) {
                    setLogs((prev) => [`[STATUS] window.kakao.maps loaded`, ...prev]);
                } else {
                    setLogs((prev) => [`[STATUS] window.kakao.maps MISSING`, ...prev]);
                }
            } else {
                setLogs((prev) => [`[STATUS] window.kakao MISSING`, ...prev]);
            }
        }, 2000);

        // Network Diagnostic
        fetch("https://dapi.kakao.com/v2/maps/sdk.js?appkey=7eb77dd1772e545a47f6066b2e87d8f&libraries=services")
            .then(res => {
                setLogs(prev => [`[DIAGNOSTIC] SDK Fetch: ${res.status} ${res.statusText}`, ...prev]);
                return res.text().then(txt => {
                    if (txt.includes("domain")) setLogs(prev => [`[DIAGNOSTIC] SDK Content: Might be domain error`, ...prev]);
                    else setLogs(prev => [`[DIAGNOSTIC] SDK Content: Length ${txt.length}`, ...prev]);
                });
            })
            .catch(err => {
                setLogs(prev => [`[DIAGNOSTIC] SDK Fetch FAILED: ${err.message}`, ...prev]);
                setLogs(prev => [`[HINT] 'Failed to fetch' often means AdBlocker is active`, ...prev]);
            });

        return () => {
            console.error = originalError;
            console.log = originalLog;
        };
    }, []);

    if (!isVisible) return <button onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-[9999] bg-red-500 text-white p-2 rounded">Show Debug</button>;

    return (
        <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none p-4">
            <div className="bg-black/80 text-green-400 font-mono text-xs p-2 rounded max-h-[300px] overflow-y-auto pointer-events-auto border border-green-500 shadow-2xl">
                <div className="flex justify-between items-center mb-2 border-b border-gray-600 pb-1">
                    <span className="font-bold text-white">🚧 Remote Debug Console</span>
                    <button onClick={() => setIsVisible(false)} className="text-white bg-gray-700 px-2 rounded">Hide</button>
                </div>
                <div className="flex flex-col gap-1">
                    {logs.length === 0 ? (
                        <div className="text-gray-500">Waiting for logs...</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className={`break-words ${log.includes("ERROR") || log.includes("CRITICAL") ? "text-red-400 font-bold bg-red-900/30" : "text-green-300"}`}>
                                {log}
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-2 text-[10px] text-gray-400">
                    Screen Size: {window.innerWidth}x{window.innerHeight} <br />
                    URL: {window.location.href}
                </div>
            </div>
        </div>
    );
}
