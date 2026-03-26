import { useState } from 'react';

export default function ResponseViewer({ response, isError }) {
    const [collapsed, setCollapsed] = useState(false);

    if (!response) return null;

    const borderColor = isError
        ? 'border-red-300 dark:border-red-700'
        : 'border-green-300 dark:border-green-700';

    const headerBg = isError
        ? 'bg-red-50 dark:bg-red-900/20'
        : 'bg-green-50 dark:bg-green-900/20';

    const headerText = isError
        ? 'text-red-700 dark:text-red-400'
        : 'text-green-700 dark:text-green-400';

    const label = isError ? 'Error en la respuesta' : 'Respuesta del servidor';

    return (
        <div className={`mt-6 rounded-lg border ${borderColor} overflow-hidden`}>
            <div
                className={`flex items-center justify-between px-4 py-3 ${headerBg} cursor-pointer select-none`}
                onClick={() => setCollapsed(c => !c)}
            >
                <span className={`text-sm font-medium ${headerText}`}>{label}</span>
                <span className={`text-xs ${headerText}`}>{collapsed ? '▼ mostrar' : '▲ ocultar'}</span>
            </div>

            {!collapsed && (
                <pre className="overflow-x-auto overflow-y-auto max-h-96 p-4 text-xs font-mono bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-relaxed">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    );
}
