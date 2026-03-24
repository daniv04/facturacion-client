import LineaDetalleForm, { emptyLine } from './LineaDetalleForm';

export { emptyLine };

export default function DetalleServicioSection({ data, errors, onChange }) {
    const lines = data.LineaDetalle;

    function addLine() {
        onChange('DetalleServicio.LineaDetalle', [...lines, emptyLine(lines.length + 1)]);
    }

    function removeLine(index) {
        const next = lines
            .filter((_, i) => i !== index)
            .map((line, i) => ({ ...line, NumeroLinea: i + 1 }));
        onChange('DetalleServicio.LineaDetalle', next);
    }

    function updateLine(index, updatedLine) {
        const next = [...lines];
        next[index] = updatedLine;
        onChange('DetalleServicio.LineaDetalle', next);
    }

    return (
        <section className="space-y-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-200 dark:border-gray-700">
                Detalle de Servicios / Productos
            </h3>

            {errors['DetalleServicio.LineaDetalle']?.[0] && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {errors['DetalleServicio.LineaDetalle'][0]}
                </p>
            )}

            <div className="space-y-3">
                {lines.map((linea, index) => (
                    <LineaDetalleForm
                        key={index}
                        linea={linea}
                        lineIndex={index}
                        errors={errors}
                        onUpdate={updated => updateLine(index, updated)}
                        onRemove={lines.length > 1 ? () => removeLine(index) : null}
                    />
                ))}
            </div>

            {lines.length < 1000 && (
                <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    + Agregar línea de detalle
                </button>
            )}
        </section>
    );
}
