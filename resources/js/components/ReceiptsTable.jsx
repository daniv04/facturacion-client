import React, { useEffect, useState } from 'react';

const STATUS_LABELS = {
    pending:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800' },
    sent:     { label: 'Enviado',    color: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Aceptado',   color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rechazado',  color: 'bg-red-100 text-red-800' },
};

const TYPE_LABELS = {
    FE:  'Factura Electrónica',
    FEE: 'Factura Exp. Electrónica',
    FEC: 'Factura Elect. Compra',
    TE:  'Tiquete Electrónico',
    ND:  'Nota de Débito',
    NC:  'Nota de Crédito',
    REP: 'Recibo Elect. de Pago',
};

function StatusBadge({ status }) {
    const { label, color } = STATUS_LABELS[status] ?? { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
    });
}

function formatAmount(amount, currency = 'CRC') {
    if (amount == null) return '—';
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency }).format(amount);
}

export default function ReceiptsTable() {
    const [receipts, setReceipts] = useState([]);
    const [meta, setMeta]         = useState(null);
    const [page, setPage]         = useState(1);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        window.axios
            .get('/api/v1/mythicbyte/e-invoicing/documents', { params: { page, per_page: 25 } })
            .then(({ data }) => {
                setReceipts(data.data ?? []);
                setMeta(data.meta ?? null);
            })
            .catch(() => setError('No se pudieron cargar los comprobantes.'))
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Comprobantes Electrónicos
            </h1>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {['#', 'Tipo', 'Consecutivo', 'Emisor', 'Receptor', 'Monto Total', 'Fecha', 'Estado', 'Estado Hacienda'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                                    Cargando...
                                </td>
                            </tr>
                        ) : receipts.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                                    No hay comprobantes registrados.
                                </td>
                            </tr>
                        ) : (
                            receipts.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-4 py-3 text-gray-500">{r.id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {TYPE_LABELS[r.receipt_type] ?? r.receipt_type}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{r.consecutive_number ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{r.emissor?.name ?? '—'}</div>
                                        <div className="text-gray-400 text-xs">{r.emissor?.number}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{r.receiver?.name ?? '—'}</div>
                                        <div className="text-gray-400 text-xs">{r.receiver?.number}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatAmount(r.amounts?.total_amount, r.amounts?.currency)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.emission_date)}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={r.receipt_status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={r.hacienda_response?.status ?? r.receipt_status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {meta && meta.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                        Página {meta.current_page} de {meta.last_page} — {meta.total} registros
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                            disabled={page === meta.last_page}
                            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
