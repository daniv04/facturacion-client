import { useMemo } from 'react';
import FormInput from '../FormInput';
import MedioPagoSection from './MedioPagoSection';

function r5(n) { return Math.round(n * 100000) / 100000; }

// Unidades de medida que corresponden a SERVICIOS según la spec de Hacienda CR
const SERVICE_UNITS = new Set(['Sp', 'Os', 'St', 'I', 'Hr', 'h', 'min', 'dia', 'mes', 'Al', 'Alc']);

// Calcula todos los totales del ResumenFactura a partir de las líneas.
// Exportado para que buildPayload en InvoiceForm pueda usarlo también.
export function calcResumen(lines) {
    let TotalServGravados = 0, TotalServExentos = 0, TotalServExonerado = 0;
    let TotalMercanciasGravadas = 0, TotalMercanciasExentas = 0, TotalMercExonerada = 0;
    let TotalDescuentos = 0, TotalImpuesto = 0, TotalImpAsumEmisorFabrica = 0;
    const desgloseMap = {};

    for (const line of lines) {
        const isService = SERVICE_UNITS.has(line.UnidadMedida);
        const subTotal  = parseFloat(line.SubTotal) || 0;
        const impNeto   = parseFloat(line.ImpuestoNeto) || 0;
        const impAsum   = parseFloat(line.ImpuestoAsumidoEmisorFabrica) || 0;
        const descuento = line.Descuento ? (parseFloat(line.Descuento.MontoDescuento) || 0) : 0;

        TotalDescuentos          += descuento;
        TotalImpuesto            += impNeto;
        TotalImpAsumEmisorFabrica += impAsum;

        const impuestos = line.Impuesto || [];

        // Una línea es EXENTA si todos sus impuestos son tarifa 01 (exento) o 02 (0%)
        const isExento = impuestos.length === 0 ||
            impuestos.every(imp => imp.CodigoTarifaIVA === '01' || imp.CodigoTarifaIVA === '02');

        let lineExoneracion = 0;
        for (const imp of impuestos) {
            const monto = parseFloat(imp.Monto) || 0;
            if (imp.Exoneracion) {
                lineExoneracion += parseFloat(imp.Exoneracion.MontoExoneracion) || 0;
            }
            // Acumula desglose por código + tarifa IVA
            const key = `${imp.Codigo}-${imp.CodigoTarifaIVA || ''}`;
            if (!desgloseMap[key]) {
                desgloseMap[key] = { Codigo: imp.Codigo, CodigoTarifaIVA: imp.CodigoTarifaIVA || null, total: 0 };
            }
            desgloseMap[key].total += monto;
        }

        if (lineExoneracion > 0) {
            if (isService) TotalServExonerado    += lineExoneracion;
            else           TotalMercExonerada    += lineExoneracion;
        }

        if (!isExento) {
            const gravado = subTotal - lineExoneracion;
            if (isService) TotalServGravados         += gravado;
            else           TotalMercanciasGravadas   += gravado;
        } else {
            if (isService) TotalServExentos       += subTotal;
            else           TotalMercanciasExentas += subTotal;
        }
    }

    const TotalGravado    = r5(TotalServGravados + TotalMercanciasGravadas);
    const TotalExento     = r5(TotalServExentos  + TotalMercanciasExentas);
    const TotalExonerado  = r5(TotalServExonerado + TotalMercExonerada);
    const TotalVenta      = r5(TotalGravado + TotalExento + TotalExonerado);
    const TotalVentaNeta  = r5(TotalVenta - r5(TotalDescuentos));

    const TotalDesgloseImpuesto = Object.values(desgloseMap)
        .filter(d => d.total > 0)
        .map(d => {
            const entry = { Codigo: d.Codigo, TotalMontoImpuesto: r5(d.total) };
            // CodigoTarifaIVA solo es obligatorio para Codigo 01 y 07
            if ((d.Codigo === '01' || d.Codigo === '07') && d.CodigoTarifaIVA) {
                entry.CodigoTarifaIVA = d.CodigoTarifaIVA;
            }
            return entry;
        });

    return {
        TotalServGravados:        r5(TotalServGravados),
        TotalServExentos:         r5(TotalServExentos),
        TotalServExonerado:       r5(TotalServExonerado),
        TotalServNoSujeto:        0,
        TotalMercanciasGravadas:  r5(TotalMercanciasGravadas),
        TotalMercanciasExentas:   r5(TotalMercanciasExentas),
        TotalMercExonerada:       r5(TotalMercExonerada),
        TotalMercNoSujeta:        0,
        TotalGravado,
        TotalExento,
        TotalExonerado,
        TotalNoSujeto:            0,
        TotalVenta,
        TotalDescuentos:          r5(TotalDescuentos),
        TotalVentaNeta,
        TotalImpuesto:            r5(TotalImpuesto),
        TotalImpAsumEmisorFabrica: r5(TotalImpAsumEmisorFabrica),
        TotalDesgloseImpuesto,
    };
}

const MONEDAS_COMUNES = ['CRC', 'USD', 'EUR', 'GBP', 'MXN', 'CAD'];

function TotalRow({ label, value, highlight }) {
    const fmt = v => typeof v === 'number'
        ? v.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 5 })
        : v;
    return (
        <div className={`flex justify-between py-1.5 px-2 rounded ${highlight ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`text-sm font-mono ${highlight ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                {fmt(value)}
            </span>
        </div>
    );
}

export default function ResumenFacturaSection({ data, lines, errors, onChange }) {
    const err    = (key) => errors[key]?.[0] ?? null;
    const totals = useMemo(() => calcResumen(lines), [lines]);

    const ivaDevuelto  = parseFloat(data.TotalIVADevuelto)  || 0;
    const otrosCargos  = parseFloat(data.TotalOtrosCargos)  || 0;
    const totalComprobante = r5(
        totals.TotalVentaNeta + totals.TotalImpuesto - totals.TotalImpAsumEmisorFabrica
        - ivaDevuelto + otrosCargos
    );

    return (
        <section className="space-y-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-200 dark:border-gray-700">
                Resumen de Factura
            </h3>

            {/* Moneda */}
            <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Moneda</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormInput
                            id="resumen-moneda"
                            label="Código Moneda *"
                            value={data.CodigoTipoMoneda.CodigoMoneda}
                            onChange={e => onChange('ResumenFactura.CodigoTipoMoneda.CodigoMoneda', e.target.value)}
                            error={err('ResumenFactura.CodigoTipoMoneda.CodigoMoneda')}
                            maxLength={3}
                            placeholder="CRC"
                            list="monedas-list"
                        />
                        <datalist id="monedas-list">
                            {MONEDAS_COMUNES.map(m => <option key={m} value={m} />)}
                        </datalist>
                    </div>
                    <FormInput
                        id="resumen-tipo-cambio"
                        label="Tipo de Cambio *"
                        type="number"
                        value={data.CodigoTipoMoneda.TipoCambio}
                        onChange={e => onChange('ResumenFactura.CodigoTipoMoneda.TipoCambio', e.target.value)}
                        error={err('ResumenFactura.CodigoTipoMoneda.TipoCambio')}
                        step="0.00001"
                        min={0}
                        placeholder="1 para CRC"
                    />
                </div>
            </div>

             {/* Medios de Pago */}
            <MedioPagoSection data={data} errors={errors} onChange={onChange} />

            {/* Totales calculados */}
            <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-4 space-y-0.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Totales (calculados automáticamente)
                </p>
                <TotalRow label="Servicios Gravados"      value={totals.TotalServGravados} />
                <TotalRow label="Servicios Exentos"       value={totals.TotalServExentos} />
                <TotalRow label="Servicios Exonerados"    value={totals.TotalServExonerado} />
                <TotalRow label="Mercancías Gravadas"     value={totals.TotalMercanciasGravadas} />
                <TotalRow label="Mercancías Exentas"      value={totals.TotalMercanciasExentas} />
                <TotalRow label="Mercancías Exoneradas"   value={totals.TotalMercExonerada} />
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <TotalRow label="Total Gravado"           value={totals.TotalGravado} />
                <TotalRow label="Total Exento"            value={totals.TotalExento} />
                <TotalRow label="Total Exonerado"         value={totals.TotalExonerado} />
                <TotalRow label="Total Venta"             value={totals.TotalVenta} highlight />
                <TotalRow label="Total Descuentos"        value={totals.TotalDescuentos} />
                <TotalRow label="Total Venta Neta"        value={totals.TotalVentaNeta} highlight />
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <TotalRow label="Total Impuesto"          value={totals.TotalImpuesto} />
                <TotalRow label="Impuesto Asumido Emisor" value={totals.TotalImpAsumEmisorFabrica} />
            </div>

            {/* Campos manuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    id="resumen-iva-devuelto"
                    label="Total IVA Devuelto"
                    type="number"
                    value={data.TotalIVADevuelto}
                    onChange={e => onChange('ResumenFactura.TotalIVADevuelto', e.target.value)}
                    error={err('ResumenFactura.TotalIVADevuelto')}
                    step="0.00001"
                    min={0}
                    placeholder="0"
                />
                <FormInput
                    id="resumen-otros-cargos"
                    label="Total Otros Cargos"
                    type="number"
                    value={data.TotalOtrosCargos}
                    onChange={e => onChange('ResumenFactura.TotalOtrosCargos', e.target.value)}
                    error={err('ResumenFactura.TotalOtrosCargos')}
                    step="0.00001"
                    min={0}
                    placeholder="0"
                />
            </div>

            {/* Total Comprobante */}
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    Total Comprobante
                </span>
                <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">
                    {totalComprobante.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                </span>
            </div>

           
        </section>
    );
}
