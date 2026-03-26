import { useState } from 'react';
import ResponseViewer from './ResponseViewer';

const TIPO_COMPROBANTE = [
    { value: 'FE',  label: 'FE  — Factura Electrónica' },
    { value: 'ND',  label: 'ND  — Nota de Débito' },
    { value: 'NC',  label: 'NC  — Nota de Crédito' },
    { value: 'TE',  label: 'TE  — Tiquete Electrónico' },
    { value: 'FEC', label: 'FEC — Factura Elect. de Compra' },
    { value: 'FEE', label: 'FEE — Factura Elect. de Exportación' },
    { value: 'REP', label: 'REP — Recibo Electrónico de Pago' },
];

export default function JsonInvoiceForm() {
    const [tipo, setTipo]         = useState('FE');
    const [json, setJson]         = useState('');
    const [error, setError]         = useState(null);
    const [success, setSuccess]     = useState(false);
    const [response, setResponse]   = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function validate() {
        if (!json.trim()) return 'Pegá el JSON de la factura.';
        try { JSON.parse(json); } catch { return 'El JSON no es válido. Revisá la sintaxis.'; }
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setSubmitting(true);
        setError(null);
        setSuccess(false);
        setResponse(null);

        try {
            const payload = JSON.parse(json);
            const { data } = await window.axios.post('/facturacion/json', { tipo, payload });
            setResponse(data);
            setJson('');
            setTipo('FE');
            setSuccess(true);
        } catch (err) {
            const errData = err.response?.data ?? { message: err.message };
            setResponse(errData);
            setError(errData.message ?? errData.error ?? 'Error al enviar la factura.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
                Enviar Factura por JSON
            </h2>

            {success && (
                <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-400">
                    Factura enviada correctamente.
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de comprobante
                    </label>
                    <select
                        value={tipo}
                        onChange={e => setTipo(e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {TIPO_COMPROBANTE.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        JSON de la factura
                    </label>
                    <textarea
                        value={json}
                        onChange={e => { setJson(e.target.value); setError(null); }}
                        rows={20}
                        spellCheck={false}
                        placeholder='{\n  "Emisor": { ... },\n  "Receptor": { ... },\n  ...\n}'
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? 'Enviando...' : 'Enviar Factura'}
                    </button>
                </div>
            </form>

            <ResponseViewer response={response} isError={!!error} />
        </div>
    );
}
