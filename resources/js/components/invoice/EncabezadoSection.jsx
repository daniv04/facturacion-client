import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

const CONDICION_VENTA = [
    { value: '01', label: '01 — Contado' },
    { value: '02', label: '02 — Crédito' },
    { value: '03', label: '03 — Consignación' },
    { value: '04', label: '04 — Apartado' },
    { value: '05', label: '05 — Arrendamiento con opción de compra' },
    { value: '06', label: '06 — Arrendamiento en función financiera' },
    { value: '07', label: '07 — Cobro a favor de un tercero' },
    { value: '08', label: '08 — Servicios al Estado a crédito' },
    { value: '10', label: '10 — Servicios al Estado al contado' },
    { value: '13', label: '13 — Pago de servicios al Estado' },
    { value: '14', label: '14 — Emitida en contingencia' },
    { value: '15', label: '15 — Pago diferido' },
    { value: '99', label: '99 — Otros' },
];

const SITUACION_COMPROBANTE = [
    { value: '1', label: '1 — Normal' },
    { value: '2', label: '2 — Contingencia' },
    { value: '3', label: '3 — Sin internet' },
];

const TIPO_COMPROBANTE = [
    { value: '01', label: '01 — Factura Electrónica' },
    { value: '02', label: '02 — Nota de Débito' },
    { value: '03', label: '03 — Nota de Crédito' },
    { value: '04', label: '04 — Tiquete Electrónico' },
    { value: '08', label: '08 — Factura Elect. de Compra' },
    { value: '09', label: '09 — Factura Elect. de Exportación' },
    { value: '10', label: '10 — Recibo Electrónico de Pago' },
];

// El backend espera Y-m-d\TH:i:sP (ej: 2026-03-23T10:00:00-06:00)
// datetime-local entrega: 2026-03-23T10:00 → le agregamos :00 y el offset de CR
function toIso8601CR(datetimeLocal) {
    if (!datetimeLocal) return '';
    // Si ya tiene segundos y offset, lo devuelve tal cual
    if (/T\d{2}:\d{2}:\d{2}[+-]/.test(datetimeLocal)) return datetimeLocal;
    const withSeconds = datetimeLocal.length === 16
        ? datetimeLocal + ':00'
        : datetimeLocal;
    return withSeconds + '-06:00';
}

// Para el input datetime-local necesitamos el valor en formato YYYY-MM-DDTHH:mm
function fromIso8601(isoStr) {
    if (!isoStr) return '';
    return isoStr.slice(0, 16);
}

export default function EncabezadoSection({ data, clave, errors, onChange }) {
    const err = (key) => errors[key]?.[0] ?? null;

    const requierePlazo  = data.CondicionVenta === '02' || data.CondicionVenta === '10';
    const requiereOtros  = data.CondicionVenta === '99';

    function handleCondicionChange(valor) {
        onChange('Encabezado.CondicionVenta', valor);
        // Limpia campos condicionales al cambiar condición
        if (valor !== '99') onChange('Encabezado.CondicionVentaOtros', '');
        if (valor !== '02' && valor !== '10') onChange('Encabezado.PlazoCredito', '');
    }

    return (
        <section className="space-y-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-200 dark:border-gray-700">
                Encabezado
            </h3>

            {/* Fecha Emisión + Situación Comprobante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    id="enc-fecha-emision"
                    label="Fecha de Emisión *"
                    type="datetime-local"
                    value={fromIso8601(data.FechaEmision)}
                    onChange={e => onChange('Encabezado.FechaEmision', toIso8601CR(e.target.value))}
                    error={err('Encabezado.FechaEmision')}
                />
                <FormSelect
                    id="enc-situacion"
                    label="Situación del Comprobante *"
                    value={data.SituacionComprobante}
                    onChange={e => onChange('Encabezado.SituacionComprobante', e.target.value)}
                    options={SITUACION_COMPROBANTE}
                    error={err('Encabezado.SituacionComprobante')}
                />
            </div>

            {/* Condición de Venta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    id="enc-condicion-venta"
                    label="Condición de Venta *"
                    value={data.CondicionVenta}
                    onChange={e => handleCondicionChange(e.target.value)}
                    options={CONDICION_VENTA}
                    error={err('Encabezado.CondicionVenta')}
                />
                <FormInput
                    id="enc-codigo-actividad"
                    label="Código Actividad Emisor"
                    value={data.CodigoActividadEmisor}
                    onChange={e => onChange('Encabezado.CodigoActividadEmisor', e.target.value)}
                    error={err('Encabezado.CodigoActividadEmisor')}
                    maxLength={6}
                    placeholder="6 dígitos (opcional)"
                />
            </div>

            {/* Condición de Venta: Otros — solo si CondicionVenta = 99 */}
            {requiereOtros && (
                <FormInput
                    id="enc-condicion-otros"
                    label="Descripción Condición de Venta *"
                    value={data.CondicionVentaOtros}
                    onChange={e => onChange('Encabezado.CondicionVentaOtros', e.target.value)}
                    error={err('Encabezado.CondicionVentaOtros')}
                    maxLength={100}
                    placeholder="Descripción de la condición (mín. 5 caracteres)"
                />
            )}

            {/* Plazo Crédito — solo si CondicionVenta = 02 o 10 */}
            {requierePlazo && (
                <FormInput
                    id="enc-plazo-credito"
                    label="Plazo de Crédito (días) *"
                    type="number"
                    value={data.PlazoCredito}
                    onChange={e => onChange('Encabezado.PlazoCredito', e.target.value)}
                    error={err('Encabezado.PlazoCredito')}
                    min={1}
                    max={5}
                    placeholder="1 – 5"
                />
            )}

            {/* Clave */}
            <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Clave del Comprobante
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        id="clave-sucursal"
                        label="Sucursal *"
                        value={clave.Sucursal}
                        onChange={e => onChange('Clave.Sucursal', e.target.value)}
                        error={err('Clave.Sucursal')}
                        maxLength={3}
                        placeholder="001"
                    />
                    <FormInput
                        id="clave-terminal"
                        label="Terminal *"
                        value={clave.Terminal}
                        onChange={e => onChange('Clave.Terminal', e.target.value)}
                        error={err('Clave.Terminal')}
                        maxLength={5}
                        placeholder="00001"
                    />
                    <FormSelect
                        id="clave-tipo-comprobante"
                        label="Tipo de Comprobante *"
                        value={clave.TipoComprobante}
                        onChange={e => onChange('Clave.TipoComprobante', e.target.value)}
                        options={TIPO_COMPROBANTE}
                        error={err('Clave.TipoComprobante')}
                    />
                </div>
            </div>
        </section>
    );
}
