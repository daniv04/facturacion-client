import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

const TIPO_MEDIO_PAGO = [
    { value: '01', label: '01 — Efectivo' },
    { value: '02', label: '02 — Tarjeta' },
    { value: '03', label: '03 — Cheque' },
    { value: '04', label: '04 — Transferencia — depósito bancario' },
    { value: '05', label: '05 — Recaudado por terceros' },
    { value: '06', label: '06 — SINPE' },
    { value: '07', label: '07 — Plataformas digitales' },
    { value: '99', label: '99 — Otros' },
];

function emptyMedio() {
    return { TipoMedioPago: '01', MedioPagoOtros: '', TotalMedioPago: '' };
}

export default function MedioPagoSection({ data, errors, onChange }) {
    const medios = data.MedioPago;

    function addMedio() {
        onChange('ResumenFactura.MedioPago', [...medios, emptyMedio()]);
    }

    function removeMedio(index) {
        onChange('ResumenFactura.MedioPago', medios.filter((_, i) => i !== index));
    }

    function updateMedio(index, field, value) {
        const next = [...medios];
        next[index] = { ...next[index], [field]: value };
        // Limpia MedioPagoOtros si ya no aplica
        if (field === 'TipoMedioPago' && value !== '99') {
            next[index].MedioPagoOtros = '';
        }
        onChange('ResumenFactura.MedioPago', next);
    }

    return (
        <section className="space-y-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-200 dark:border-gray-700">
                Medios de Pago
            </h3>

            {errors['ResumenFactura.MedioPago']?.[0] && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {errors['ResumenFactura.MedioPago'][0]}
                </p>
            )}

            <div className="space-y-3">
                {medios.map((medio, index) => {
                    const err = (key) => errors[`ResumenFactura.MedioPago.${index}.${key}`]?.[0] ?? null;
                    const esOtro = medio.TipoMedioPago === '99';

                    return (
                        <div key={index} className="rounded-md border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Medio {index + 1}
                                </span>
                                {medios.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMedio(index)}
                                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormSelect
                                    id={`medio-tipo-${index}`}
                                    label="Tipo de Medio de Pago *"
                                    value={medio.TipoMedioPago}
                                    onChange={e => updateMedio(index, 'TipoMedioPago', e.target.value)}
                                    options={TIPO_MEDIO_PAGO}
                                    error={err('TipoMedioPago')}
                                />
                                <FormInput
                                    id={`medio-total-${index}`}
                                    label="Total Medio de Pago *"
                                    type="number"
                                    value={medio.TotalMedioPago}
                                    onChange={e => updateMedio(index, 'TotalMedioPago', e.target.value)}
                                    error={err('TotalMedioPago')}
                                    step="0.00001"
                                    min={0}
                                    placeholder="0.00"
                                />
                            </div>

                            {esOtro && (
                                <FormInput
                                    id={`medio-otros-${index}`}
                                    label="Descripción Medio de Pago *"
                                    value={medio.MedioPagoOtros}
                                    onChange={e => updateMedio(index, 'MedioPagoOtros', e.target.value)}
                                    error={err('MedioPagoOtros')}
                                    maxLength={100}
                                    placeholder="Mín. 3 caracteres"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {medios.length < 4 && (
                <button
                    type="button"
                    onClick={addMedio}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    + Agregar medio de pago
                </button>
            )}
        </section>
    );
}
