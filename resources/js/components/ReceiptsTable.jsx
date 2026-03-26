import React, { useEffect, useState } from 'react';

const RECEIPT_STATUS_LABELS = {
    pending:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    sent:     { label: 'Enviado',    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    accepted: { label: 'Aceptado',   color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    rejected: { label: 'Rechazado',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

const HACIENDA_STATUS_LABELS = {
    accepted:  { label: 'Aceptado',          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    rejected:  { label: 'Rechazado',          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    partial:   { label: 'Aceptado Parcial',   color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    pending:   { label: 'Pendiente',          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
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

function StatusBadge({ status, labels }) {
    const { label, color } = labels[status] ?? { label: status ?? '—', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
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

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-CR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

const COLS = [
    { label: 'Tipo' },
    { label: 'UI Key' },
    { label: 'Consecutivo' },
    { label: 'Fecha Emisión' },
    { label: 'Enviado a Hacienda' },
    { label: 'Estado' },
    { label: 'Estado Hacienda' },
];

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

    const colSpan = COLS.length;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Comprobantes Electrónicos
                </h1>
                <a
                    href="/facturacion"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    Nueva Factura
                </a>
            </div>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {COLS.map(({ label }) => (
                                <th key={label} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                        {loading ? (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-10 text-center text-gray-400">
                                    Cargando...
                                </td>
                            </tr>
                        ) : receipts.length === 0 ? (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-10 text-center text-gray-400">
                                    No hay comprobantes registrados.
                                </td>
                            </tr>
                        ) : (
                            receipts.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {TYPE_LABELS[r.receipt_type] ?? r.receipt_type ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                                        {r.ui_key ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                                        {r.consecutive_number ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {formatDate(r.emission_date)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                        {formatDateTime(r.sent_to_hacienda_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={r.receipt_status} labels={RECEIPT_STATUS_LABELS} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={r.hacienda_status ?? r.hacienda_response?.status} labels={HACIENDA_STATUS_LABELS} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {meta && meta.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                        Página {meta.current_page} de {meta.last_page} — {meta.total} registros
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                            disabled={page === meta.last_page}
                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
