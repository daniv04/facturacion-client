import { useState } from 'react';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import ExoneracionForm from './ExoneracionForm';

// ── Helpers de cálculo ─────────────────────────────────────────
function r5(n) { return Math.round(n * 100000) / 100000; }

function recalc(linea) {
    const cant       = parseFloat(linea.Cantidad) || 0;
    const pu         = parseFloat(linea.PrecioUnitario) || 0;
    const montoTotal = r5(cant * pu);
    const montoDesc  = linea.Descuento ? (parseFloat(linea.Descuento.MontoDescuento) || 0) : 0;
    const subTotal   = r5(montoTotal - montoDesc);
    const impNeto    = (linea.Impuesto || []).reduce(
        (s, imp) => r5(s + (parseFloat(imp.Monto) || 0)), 0
    );
    return {
        ...linea,
        MontoTotal:     String(montoTotal),
        SubTotal:       String(subTotal),
        BaseImponible:  String(subTotal),
        ImpuestoNeto:   String(impNeto),
        MontoTotalLinea: String(r5(subTotal + impNeto)),
    };
}

// ── Objetos vacíos ─────────────────────────────────────────────
function emptyImpuesto() {
    return {
        Codigo: '01',
        CodigoTarifaIVA: '08',
        CodigoImpuestoOtro: '',
        Tarifa: '13',
        FactorCalculoIVA: '',
        Monto: '',
        Exoneracion: null,
    };
}

function emptyExoneracion() {
    return {
        TipoDocumentoEX1: '01',
        TipoDocumentoOTRO: '',
        NumeroDocumento: '',
        Articulo: '',
        Inciso: '',
        NombreInstitucion: '',
        NombreInstitucionOTRO: '',
        FechaEmisionEX: '',
        TarifaExonerada: '',
        MontoExoneracion: '',
    };
}

function emptyDescuento() {
    return {
        MontoDescuento: '',
        CodigoDescuento: '01',
        CodigoDescuentoOtro: '',
        NaturalezaDescuento: '',
    };
}

// Exportado para que DetalleServicioSection e InvoiceForm puedan usarlo
export function emptyLine(numero) {
    return {
        NumeroLinea: numero,
        CodigoCABYS: '',
        PartidaArancelaria: '',
        CodigoComercial: [],
        Cantidad: '',
        UnidadMedida: '',
        TipoTransaccion: '',
        UnidadMedidaComercial: '',
        Detalle: '',
        PrecioUnitario: '',
        MontoTotal: '0',
        Descuento: null,
        Impuesto: [emptyImpuesto()],
        SubTotal: '0',
        IVACobradoFabrica: '',
        BaseImponible: '0',
        ImpuestoAsumidoEmisorFabrica: '0',
        ImpuestoNeto: '0',
        MontoTotalLinea: '0',
    };
}

// ── Catálogos ──────────────────────────────────────────────────
const TIPOS_TRANSACCION = [
    { value: '',   label: 'Sin tipo (opcional)' },
    { value: '01', label: '01 — Venta de bienes' },
    { value: '02', label: '02 — Prestación de servicios' },
    { value: '03', label: '03 — Arrendamiento' },
    { value: '04', label: '04 — Exportación' },
    { value: '05', label: '05 — Importación' },
    { value: '06', label: '06 — Uso o consumo propio' },
    { value: '07', label: '07 — Donación' },
    { value: '08', label: '08 — Distribución' },
    { value: '09', label: '09 — Consignación' },
    { value: '10', label: '10 — Factura con IVA incluido' },
    { value: '11', label: '11 — Importación exenta' },
    { value: '12', label: '12 — Ventas en punto de venta' },
    { value: '13', label: '13 — Servicios por cuenta de terceros' },
];

const CODIGOS_DESCUENTO = [
    { value: '01', label: '01 — Por volumen' },
    { value: '02', label: '02 — En efectivo' },
    { value: '03', label: '03 — Pronto pago' },
    { value: '04', label: '04 — Precio' },
    { value: '05', label: '05 — Comercial' },
    { value: '06', label: '06 — Apertura de cuenta' },
    { value: '07', label: '07 — Especial' },
    { value: '08', label: '08 — Inicio de temporada' },
    { value: '09', label: '09 — Segunda opción' },
    { value: '99', label: '99 — Otro' },
];

const CODIGOS_IMPUESTO = [
    { value: '01', label: '01 — IVA' },
    { value: '02', label: '02 — Selectivo de Consumo' },
    { value: '03', label: '03 — Único Combustibles' },
    { value: '04', label: '04 — Bebidas sin alcohol / Jabones' },
    { value: '05', label: '05 — Bebidas con alcohol' },
    { value: '06', label: '06 — Tabaco y derivados' },
    { value: '07', label: '07 — Cemento' },
    { value: '08', label: '08 — Personas Jurídicas' },
    { value: '12', label: '12 — Licores' },
    { value: '99', label: '99 — Otro' },
];

const CODIGOS_TARIFA_IVA = [
    { value: '',   label: 'N/A' },
    { value: '01', label: '01 — Exento' },
    { value: '02', label: '02 — 0% (sin desglose)' },
    { value: '03', label: '03 — 1% reducida' },
    { value: '04', label: '04 — 2% reducida' },
    { value: '05', label: '05 — 4% reducida' },
    { value: '06', label: '06 — Diferenciada' },
    { value: '07', label: '07 — 8%' },
    { value: '08', label: '08 — 13% general' },
    { value: '09', label: '09 — 4% transición' },
    { value: '10', label: '10 — 8% transición' },
    { value: '11', label: '11 — 1% canasta básica' },
];

const IVA_COBRADO = [
    { value: '',   label: 'N/A' },
    { value: '01', label: '01 — IVA cobrado en fábrica' },
    { value: '02', label: '02 — IVA no cobrado en fábrica' },
];

const UNIDADES_COMUNES = ['Sp', 'unid', 'm', 'm2', 'm3', 'kg', 'g', 'l', 'ml', 'Hr', 'min', 'dia', 'mes'];

// ── Componente ─────────────────────────────────────────────────
// onUpdate(updatedLine) reemplaza la línea completa en el padre
export default function LineaDetalleForm({ linea, lineIndex, errors, onUpdate, onRemove }) {
    const [expanded, setExpanded]         = useState(lineIndex === 0);
    const [showAvanzados, setShowAvanzados] = useState(false);

    const base = `DetalleServicio.LineaDetalle.${lineIndex}`;
    const err  = (key) => errors[`${base}.${key}`]?.[0] ?? null;

    // ── Handlers de campos simples ──────────────────────────────
    function handleChange(field, value) {
        const updated = { ...linea, [field]: value };
        if (field === 'Cantidad' || field === 'PrecioUnitario') {
            onUpdate(recalc(updated));
        } else {
            onUpdate(updated);
        }
    }

    // ── Descuento ───────────────────────────────────────────────
    function handleDescuentoToggle(checked) {
        onUpdate(recalc({ ...linea, Descuento: checked ? emptyDescuento() : null }));
    }

    function handleDescuentoChange(field, value) {
        const updated = { ...linea, Descuento: { ...linea.Descuento, [field]: value } };
        onUpdate(field === 'MontoDescuento' ? recalc(updated) : updated);
    }

    // ── Impuesto ────────────────────────────────────────────────
    function addImpuesto() {
        onUpdate(recalc({ ...linea, Impuesto: [...linea.Impuesto, emptyImpuesto()] }));
    }

    function removeImpuesto(i) {
        onUpdate(recalc({ ...linea, Impuesto: linea.Impuesto.filter((_, idx) => idx !== i) }));
    }

    function handleImpuestoChange(i, field, value) {
        const impuestos = [...linea.Impuesto];
        impuestos[i] = { ...impuestos[i], [field]: value };
        const updated = { ...linea, Impuesto: impuestos };
        onUpdate(field === 'Monto' ? recalc(updated) : updated);
    }

    // ── Exoneración ─────────────────────────────────────────────
    function handleExoneracionToggle(impIdx, checked) {
        const impuestos = [...linea.Impuesto];
        impuestos[impIdx] = { ...impuestos[impIdx], Exoneracion: checked ? emptyExoneracion() : null };
        onUpdate({ ...linea, Impuesto: impuestos });
    }

    function handleExoneracionChange(impIdx, field, value) {
        const impuestos = [...linea.Impuesto];
        impuestos[impIdx] = {
            ...impuestos[impIdx],
            Exoneracion: { ...impuestos[impIdx].Exoneracion, [field]: value },
        };
        onUpdate({ ...linea, Impuesto: impuestos });
    }

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">

            {/* ── Cabecera del acordeón ── */}
            <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
            >
                <span className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold">
                        {linea.NumeroLinea}
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {linea.Detalle || 'Nueva línea'}
                    </span>
                    {parseFloat(linea.MontoTotalLinea) > 0 && (
                        <span className="shrink-0 text-sm text-gray-400">
                            ₡ {parseFloat(linea.MontoTotalLinea).toLocaleString('es-CR')}
                        </span>
                    )}
                </span>
                <span className="flex items-center gap-3 ml-4 shrink-0">
                    {onRemove && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={e => { e.stopPropagation(); onRemove(); }}
                            onKeyDown={e => e.key === 'Enter' && (e.stopPropagation(), onRemove())}
                            className="text-xs text-red-500 hover:text-red-700"
                        >
                            Eliminar
                        </span>
                    )}
                    <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
                </span>
            </button>

            {expanded && (
                <div className="p-4 space-y-6">

                    {/* ── Campos principales ── */}
                    <div className="space-y-4">
                        <FormInput
                            id={`${base}-cabys`}
                            label="Código CABYS * (13 dígitos)"
                            value={linea.CodigoCABYS}
                            onChange={e => handleChange('CodigoCABYS', e.target.value)}
                            error={err('CodigoCABYS')}
                            maxLength={13}
                            placeholder="0000000000000"
                        />
                        <FormInput
                            id={`${base}-detalle`}
                            label="Descripción / Detalle *"
                            value={linea.Detalle}
                            onChange={e => handleChange('Detalle', e.target.value)}
                            error={err('Detalle')}
                            maxLength={200}
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput
                                id={`${base}-cantidad`}
                                label="Cantidad *"
                                type="number"
                                value={linea.Cantidad}
                                onChange={e => handleChange('Cantidad', e.target.value)}
                                error={err('Cantidad')}
                                step="0.001"
                                min={0}
                            />
                            <div>
                                <FormInput
                                    id={`${base}-unidad`}
                                    label="Unidad Medida *"
                                    value={linea.UnidadMedida}
                                    onChange={e => handleChange('UnidadMedida', e.target.value)}
                                    error={err('UnidadMedida')}
                                    maxLength={20}
                                    placeholder="Sp, unid, kg..."
                                    list={`${base}-unidad-list`}
                                />
                                <datalist id={`${base}-unidad-list`}>
                                    {UNIDADES_COMUNES.map(u => <option key={u} value={u} />)}
                                </datalist>
                            </div>
                            <FormInput
                                id={`${base}-precio`}
                                label="Precio Unitario *"
                                type="number"
                                value={linea.PrecioUnitario}
                                onChange={e => handleChange('PrecioUnitario', e.target.value)}
                                error={err('PrecioUnitario')}
                                step="0.00001"
                                min={0}
                            />
                            <FormSelect
                                id={`${base}-tipo-transaccion`}
                                label="Tipo Transacción"
                                value={linea.TipoTransaccion}
                                onChange={e => handleChange('TipoTransaccion', e.target.value)}
                                options={TIPOS_TRANSACCION}
                                error={err('TipoTransaccion')}
                            />
                        </div>
                    </div>

                    {/* ── Campos opcionales ── */}
                    <div>
                        <button type="button"
                            onClick={() => setShowAvanzados(s => !s)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                        >
                            {showAvanzados ? '▲' : '▼'} Campos opcionales
                        </button>
                        {showAvanzados && (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    id={`${base}-partida`}
                                    label="Partida Arancelaria"
                                    value={linea.PartidaArancelaria}
                                    onChange={e => handleChange('PartidaArancelaria', e.target.value)}
                                    error={err('PartidaArancelaria')}
                                    maxLength={12}
                                />
                                <FormInput
                                    id={`${base}-unidad-comercial`}
                                    label="Unidad Medida Comercial"
                                    value={linea.UnidadMedidaComercial}
                                    onChange={e => handleChange('UnidadMedidaComercial', e.target.value)}
                                    error={err('UnidadMedidaComercial')}
                                    maxLength={20}
                                />
                                <FormSelect
                                    id={`${base}-iva-fabrica`}
                                    label="IVA Cobrado en Fábrica"
                                    value={linea.IVACobradoFabrica}
                                    onChange={e => handleChange('IVACobradoFabrica', e.target.value)}
                                    options={IVA_COBRADO}
                                    error={err('IVACobradoFabrica')}
                                />
                                <FormInput
                                    id={`${base}-reg-med`}
                                    label="Registro Medicamento"
                                    value={linea.RegistroMedicamento}
                                    onChange={e => handleChange('RegistroMedicamento', e.target.value)}
                                    error={err('RegistroMedicamento')}
                                    maxLength={100}
                                />
                                <FormInput
                                    id={`${base}-forma-farm`}
                                    label="Forma Farmacéutica"
                                    value={linea.FormaFarmaceutica}
                                    onChange={e => handleChange('FormaFarmaceutica', e.target.value)}
                                    error={err('FormaFarmaceutica')}
                                    maxLength={3}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Descuento ── */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={linea.Descuento !== null}
                                onChange={e => handleDescuentoToggle(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Agregar descuento
                            </span>
                        </label>

                        {linea.Descuento !== null && (
                            <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    id={`${base}-desc-monto`}
                                    label="Monto Descuento *"
                                    type="number"
                                    value={linea.Descuento.MontoDescuento}
                                    onChange={e => handleDescuentoChange('MontoDescuento', e.target.value)}
                                    error={err('Descuento.MontoDescuento')}
                                    step="0.00001" min={0}
                                />
                                <FormSelect
                                    id={`${base}-desc-codigo`}
                                    label="Código Descuento *"
                                    value={linea.Descuento.CodigoDescuento}
                                    onChange={e => handleDescuentoChange('CodigoDescuento', e.target.value)}
                                    options={CODIGOS_DESCUENTO}
                                    error={err('Descuento.CodigoDescuento')}
                                />
                                {linea.Descuento.CodigoDescuento === '99' && (
                                    <>
                                        <FormInput
                                            id={`${base}-desc-otro`}
                                            label="Descripción Descuento *"
                                            value={linea.Descuento.CodigoDescuentoOtro}
                                            onChange={e => handleDescuentoChange('CodigoDescuentoOtro', e.target.value)}
                                            error={err('Descuento.CodigoDescuentoOtro')}
                                            maxLength={100}
                                        />
                                        <FormInput
                                            id={`${base}-desc-naturaleza`}
                                            label="Naturaleza Descuento *"
                                            value={linea.Descuento.NaturalezaDescuento}
                                            onChange={e => handleDescuentoChange('NaturalezaDescuento', e.target.value)}
                                            error={err('Descuento.NaturalezaDescuento')}
                                            maxLength={80}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Impuestos ── */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Impuesto(s) *{' '}
                            <span className="font-normal text-gray-400">mín. 1</span>
                        </p>
                        {err('Impuesto') && (
                            <p className="text-xs text-red-600 dark:text-red-400">{err('Impuesto')}</p>
                        )}

                        {linea.Impuesto.map((imp, impIdx) => (
                            <div key={impIdx}
                                className="border border-gray-200 dark:border-gray-600 rounded-md p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Impuesto {impIdx + 1}
                                    </p>
                                    {linea.Impuesto.length > 1 && (
                                        <button type="button"
                                            onClick={() => removeImpuesto(impIdx)}
                                            className="text-xs text-red-500 hover:text-red-700">
                                            Eliminar
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FormSelect
                                        id={`${base}-imp${impIdx}-codigo`}
                                        label="Código *"
                                        value={imp.Codigo}
                                        onChange={e => handleImpuestoChange(impIdx, 'Codigo', e.target.value)}
                                        options={CODIGOS_IMPUESTO}
                                        error={errors[`${base}.Impuesto.${impIdx}.Codigo`]?.[0]}
                                    />
                                    <FormSelect
                                        id={`${base}-imp${impIdx}-tarifa-iva`}
                                        label="Código Tarifa IVA"
                                        value={imp.CodigoTarifaIVA}
                                        onChange={e => handleImpuestoChange(impIdx, 'CodigoTarifaIVA', e.target.value)}
                                        options={CODIGOS_TARIFA_IVA}
                                        error={errors[`${base}.Impuesto.${impIdx}.CodigoTarifaIVA`]?.[0]}
                                    />
                                    <FormInput
                                        id={`${base}-imp${impIdx}-tarifa`}
                                        label="Tarifa %"
                                        type="number"
                                        value={imp.Tarifa}
                                        onChange={e => handleImpuestoChange(impIdx, 'Tarifa', e.target.value)}
                                        error={errors[`${base}.Impuesto.${impIdx}.Tarifa`]?.[0]}
                                        step="0.01" min={0} max={100}
                                        placeholder="13"
                                    />
                                </div>

                                {imp.Codigo === '99' && (
                                    <FormInput
                                        id={`${base}-imp${impIdx}-otro`}
                                        label="Descripción Impuesto *"
                                        value={imp.CodigoImpuestoOtro}
                                        onChange={e => handleImpuestoChange(impIdx, 'CodigoImpuestoOtro', e.target.value)}
                                        error={errors[`${base}.Impuesto.${impIdx}.CodigoImpuestoOtro`]?.[0]}
                                        maxLength={100}
                                    />
                                )}

                                {imp.Codigo === '08' && (
                                    <FormInput
                                        id={`${base}-imp${impIdx}-factor`}
                                        label="Factor Cálculo IVA *"
                                        type="number"
                                        value={imp.FactorCalculoIVA}
                                        onChange={e => handleImpuestoChange(impIdx, 'FactorCalculoIVA', e.target.value)}
                                        error={errors[`${base}.Impuesto.${impIdx}.FactorCalculoIVA`]?.[0]}
                                        step="0.0001" min={0} max={9.9999}
                                    />
                                )}

                                <FormInput
                                    id={`${base}-imp${impIdx}-monto`}
                                    label="Monto *"
                                    type="number"
                                    value={imp.Monto}
                                    onChange={e => handleImpuestoChange(impIdx, 'Monto', e.target.value)}
                                    error={errors[`${base}.Impuesto.${impIdx}.Monto`]?.[0]}
                                    step="0.00001" min={0}
                                />

                                {imp.Exoneracion === null ? (
                                    <button type="button"
                                        onClick={() => handleExoneracionToggle(impIdx, true)}
                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                        + Agregar exoneración
                                    </button>
                                ) : (
                                    <ExoneracionForm
                                        data={imp.Exoneracion}
                                        prefix={`${base}.Impuesto.${impIdx}.Exoneracion`}
                                        errors={errors}
                                        onChange={(field, value) => handleExoneracionChange(impIdx, field, value)}
                                        onRemove={() => handleExoneracionToggle(impIdx, false)}
                                    />
                                )}
                            </div>
                        ))}

                        <button type="button"
                            onClick={addImpuesto}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                            + Agregar impuesto
                        </button>
                    </div>

                    {/* ── Totales calculados (readonly) ── */}
                    <div className="rounded-md bg-gray-50 dark:bg-gray-800/60 p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Totales (calculados automáticamente)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                ['Monto Total',      linea.MontoTotal],
                                ['SubTotal',         linea.SubTotal],
                                ['Base Imponible',   linea.BaseImponible],
                                ['Impuesto Neto',    linea.ImpuestoNeto],
                                ['Monto Total Línea', linea.MontoTotalLinea],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                    <p className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                                        {value || '0'}
                                    </p>
                                </div>
                            ))}
                            <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                                    Impuesto Asumido Emisor *
                                </label>
                                <input
                                    type="number"
                                    value={linea.ImpuestoAsumidoEmisorFabrica}
                                    onChange={e => handleChange('ImpuestoAsumidoEmisorFabrica', e.target.value)}
                                    className="w-full text-sm font-mono rounded-md border px-2 py-1.5 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    step="0.00001" min={0}
                                />
                                {err('ImpuestoAsumidoEmisorFabrica') && (
                                    <p className="text-xs text-red-500 mt-0.5">
                                        {err('ImpuestoAsumidoEmisorFabrica')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
