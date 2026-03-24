import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

const TIPO_DOC_EX1 = [
    { value: '01', label: '01 — Ley especial' },
    { value: '02', label: '02 — Ley general' },
    { value: '03', label: '03 — Decretos' },
    { value: '04', label: '04 — Min. Hacienda' },
    { value: '05', label: '05 — COMEX' },
    { value: '06', label: '06 — Reglamentos' },
    { value: '07', label: '07 — Resoluciones' },
    { value: '08', label: '08 — DGA' },
    { value: '09', label: '09 — DGPN' },
    { value: '10', label: '10 — BCCR' },
    { value: '11', label: '11 — Resolución de exoneración' },
    { value: '99', label: '99 — Otros' },
];

const NOMBRE_INSTITUCION = [
    { value: '',   label: 'Seleccione...' },
    { value: '01', label: '01 — Presidencia de la República' },
    { value: '02', label: '02 — Ministerio de Hacienda' },
    { value: '03', label: '03 — Poder Judicial' },
    { value: '04', label: '04 — Ministerio de Educación' },
    { value: '05', label: '05 — CCSS' },
    { value: '06', label: '06 — ICE' },
    { value: '07', label: '07 — AyA' },
    { value: '08', label: '08 — Municipalidades' },
    { value: '12', label: '12 — Otro Ministerio/Institución' },
    { value: '99', label: '99 — Otro' },
];

function toIso(v) {
    if (!v) return '';
    if (/T\d{2}:\d{2}:\d{2}[+-]/.test(v)) return v;
    return (v.length === 16 ? v + ':00' : v) + '-06:00';
}
function fromIso(v) { return v ? v.slice(0, 16) : ''; }

// onChange(fieldName, value) — fieldName es relativo a Exoneracion (ej: 'TipoDocumentoEX1')
// prefix se usa solo para buscar errores (ej: 'DetalleServicio.LineaDetalle.0.Impuesto.0.Exoneracion')
export default function ExoneracionForm({ data, prefix, errors, onChange, onRemove }) {
    const err = (key) => errors[`${prefix}.${key}`]?.[0] ?? null;

    const requiereDocOtro  = data.TipoDocumentoEX1 === '99';
    const requiereArticulo = ['02','03','06','07','08'].includes(data.TipoDocumentoEX1);
    const requiereInstOtro = data.NombreInstitucion === '99';

    return (
        <div className="rounded-md border border-orange-200 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                    Exoneración
                </p>
                <button type="button" onClick={onRemove}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400">
                    Eliminar exoneración
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormSelect
                    id={`${prefix}-tipo`}
                    label="Tipo de Documento *"
                    value={data.TipoDocumentoEX1}
                    onChange={e => onChange('TipoDocumentoEX1', e.target.value)}
                    options={TIPO_DOC_EX1}
                    error={err('TipoDocumentoEX1')}
                />
                <FormInput
                    id={`${prefix}-num-doc`}
                    label="Número de Documento *"
                    value={data.NumeroDocumento}
                    onChange={e => onChange('NumeroDocumento', e.target.value)}
                    error={err('NumeroDocumento')}
                    maxLength={40}
                    placeholder="Mín. 3 caracteres"
                />
            </div>

            {requiereDocOtro && (
                <FormInput
                    id={`${prefix}-doc-otro`}
                    label="Descripción Tipo Documento *"
                    value={data.TipoDocumentoOTRO}
                    onChange={e => onChange('TipoDocumentoOTRO', e.target.value)}
                    error={err('TipoDocumentoOTRO')}
                    maxLength={100}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormSelect
                    id={`${prefix}-inst`}
                    label="Institución *"
                    value={data.NombreInstitucion}
                    onChange={e => onChange('NombreInstitucion', e.target.value)}
                    options={NOMBRE_INSTITUCION}
                    error={err('NombreInstitucion')}
                />
                <FormInput
                    id={`${prefix}-fecha`}
                    label="Fecha Emisión Exoneración *"
                    type="datetime-local"
                    value={fromIso(data.FechaEmisionEX)}
                    onChange={e => onChange('FechaEmisionEX', toIso(e.target.value))}
                    error={err('FechaEmisionEX')}
                />
            </div>

            {requiereInstOtro && (
                <FormInput
                    id={`${prefix}-inst-otro`}
                    label="Nombre Institución *"
                    value={data.NombreInstitucionOTRO}
                    onChange={e => onChange('NombreInstitucionOTRO', e.target.value)}
                    error={err('NombreInstitucionOTRO')}
                    maxLength={160}
                />
            )}

            {requiereArticulo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                        id={`${prefix}-articulo`}
                        label="Artículo *"
                        type="number"
                        value={data.Articulo}
                        onChange={e => onChange('Articulo', e.target.value)}
                        error={err('Articulo')}
                        min={1} max={999999}
                    />
                    <FormInput
                        id={`${prefix}-inciso`}
                        label="Inciso"
                        type="number"
                        value={data.Inciso}
                        onChange={e => onChange('Inciso', e.target.value)}
                        error={err('Inciso')}
                        min={1} max={999999}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                    id={`${prefix}-tarifa`}
                    label="Tarifa Exonerada *"
                    type="number"
                    value={data.TarifaExonerada}
                    onChange={e => onChange('TarifaExonerada', e.target.value)}
                    error={err('TarifaExonerada')}
                    step="0.01" min={0}
                    placeholder="0 – 99.99"
                />
                <FormInput
                    id={`${prefix}-monto`}
                    label="Monto Exoneración *"
                    type="number"
                    value={data.MontoExoneracion}
                    onChange={e => onChange('MontoExoneracion', e.target.value)}
                    error={err('MontoExoneracion')}
                    step="0.00001" min={0}
                />
            </div>
        </div>
    );
}
