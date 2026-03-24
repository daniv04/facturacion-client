export default function FormInput({
    label,
    id,
    type = 'text',
    error,
    className = '',
    ...props
}) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}

            <input
                id={id}
                type={type}
                className={`
                    w-full rounded-md border px-3 py-2 text-sm
                    text-gray-900 dark:text-gray-100
                    bg-white dark:bg-gray-800
                    border-gray-300 dark:border-gray-600
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `.trim()}
                {...props}
            />

            {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}
