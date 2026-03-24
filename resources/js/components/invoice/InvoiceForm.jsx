import { useState } from 'react';
import EmisorSection from './EmisorSection';
import ReceptorSection from './ReceptorSection';
import EncabezadoSection from './EncabezadoSection';
import DetalleServicioSection, { emptyLine } from './DetalleServicioSection';
import ResumenFacturaSection, { calcResumen } from './ResumenFacturaSection';

// Actualiza un valor anidado en un objeto usando dot notation.
// setIn({ a: { b: 1 } }, 'a.b', 2) → { a: { b: 2 } }
function setIn(obj, path, value) {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = Array.isArray(current[key])
            ? [...current[key]]
            : { ...current[key] };
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return result;
}

const INITIAL_FORM = {
    Emisor: {
        Nombre: '',
        Identificacion: { Tipo: '01', Numero: '' },
        RegistroFiscal8707: '',
        NombreComercial: '',
        Ubicacion: { Provincia: '', Canton: '', Distrito: '', Barrio: '', OtrasSenas: '' },
        Telefono: { CodigoPais: '', NumTelefono: '' },
        CorreoElectronico: [''],
    },
    Receptor: {
        Nombre: '',
        Identificacion: { Tipo: '01', Numero: '' },
        NombreComercial: '',
        OtrasSenasExtranjero: '',
        Ubicacion: { Provincia: '', Canton: '', Distrito: '', Barrio: '', OtrasSenas: '' },
        Telefono: { CodigoPais: '', NumTelefono: '' },
        CorreoElectronico: '',
    },
    Encabezado: {
        FechaEmision: '',
        CodigoActividadEmisor: '',
        CondicionVenta: '01',
        CondicionVentaOtros: '',
        PlazoCredito: '',
        SituacionComprobante: '1',
    },
    Clave: {
        Sucursal: '',
        Terminal: '',
        TipoComprobante: '01',
    },
    DetalleServicio: {
        LineaDetalle: [emptyLine(1)],
    },
    ResumenFactura: {
        CodigoTipoMoneda: { CodigoMoneda: 'CRC', TipoCambio: '1' },
        MedioPago: [{ TipoMedioPago: '01', MedioPagoOtros: '', TotalMedioPago: '' }],
        TotalIVADevuelto: '0',
        TotalOtrosCargos: '0',
    },
};

export default function InvoiceForm() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    function handleChange(path, value) {
        setForm(prev => setIn(prev, path, value));
        // Limpia el error del campo al editar
        if (errors[path]) {
            setErrors(prev => { const e = { ...prev }; delete e[path]; return e; });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setSuccess(false);

        try {
            const { data } = await window.axios.post('/facturacion', buildPayload(form));
            console.log('✅ Respuesta del servidor:', data);
            setSuccess(true);
        } catch (err) {
            console.error('❌ Error:', err.response?.data ?? err.message);
            setErrors(err.response?.data?.errors ?? {});

            // Scroll al primer error
            setTimeout(() => {
                document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
                Nueva Factura Electrónica
            </h2>

            {success && (
                <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-400">
                    Factura enviada correctamente.
                </div>
            )}

            {Object.keys(errors).length > 0 && !success && (
                <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
                    Hay errores en el formulario. Revisá los campos marcados.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10" noValidate>


                <EncabezadoSection
                    data={form.Encabezado}
                    clave={form.Clave}
                    errors={errors}
                    onChange={handleChange}
                />
                <EmisorSection
                    data={form.Emisor}
                    errors={errors}
                    onChange={handleChange}
                />

                <ReceptorSection
                    data={form.Receptor}
                    errors={errors}
                    onChange={handleChange}
                />



                <DetalleServicioSection
                    data={form.DetalleServicio}
                    errors={errors}
                    onChange={handleChange}
                />

                <ResumenFacturaSection
                    data={form.ResumenFactura}
                    lines={form.DetalleServicio.LineaDetalle}
                    errors={errors}
                    onChange={handleChange}
                />

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? 'Enviando...' : 'Enviar Factura'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Elimina recursivamente null, strings vacíos, arrays vacíos y objetos vacíos.
function stripEmpty(value) {
    if (value === null || value === undefined || value === '') return undefined;
    if (Array.isArray(value)) {
        const arr = value.map(stripEmpty).filter(v => v !== undefined);
        return arr.length ? arr : undefined;
    }
    if (typeof value === 'object') {
        const cleaned = Object.fromEntries(
            Object.entries(value)
                .map(([k, v]) => [k, stripEmpty(v)])
                .filter(([, v]) => v !== undefined)
        );
        return Object.keys(cleaned).length ? cleaned : undefined;
    }
    return value;
}

// Limpia los campos opcionales vacíos antes de enviar,
// para no mandar objetos vacíos al backend.
function buildPayload(form) {
    const emisor = { ...form.Emisor };

    // Omite Telefono si sus campos están vacíos
    if (!emisor.Telefono.CodigoPais && !emisor.Telefono.NumTelefono) {
        delete emisor.Telefono;
    }

    // Omite Ubicacion si todos sus campos están vacíos
    const ub = emisor.Ubicacion;
    if (!ub.Provincia && !ub.Canton && !ub.Distrito && !ub.OtrasSenas) {
        delete emisor.Ubicacion;
    }

    // Omite strings opcionales vacíos
    if (!emisor.RegistroFiscal8707) delete emisor.RegistroFiscal8707;
    if (!emisor.NombreComercial) delete emisor.NombreComercial;

    // Construye ResumenFactura con totales calculados
    const calculado = calcResumen(form.DetalleServicio.LineaDetalle);
    const ivaDevuelto = parseFloat(form.ResumenFactura.TotalIVADevuelto) || 0;
    const otrosCargos = parseFloat(form.ResumenFactura.TotalOtrosCargos) || 0;
    const resumen = {
        CodigoTipoMoneda: form.ResumenFactura.CodigoTipoMoneda,
        ...calculado,
        TotalIVADevuelto: ivaDevuelto,
        TotalOtrosCargos: otrosCargos,
        TotalComprobante: Math.round(
            (calculado.TotalVentaNeta + calculado.TotalImpuesto
             - calculado.TotalImpAsumEmisorFabrica - ivaDevuelto + otrosCargos) * 100000
        ) / 100000,
        MedioPago: form.ResumenFactura.MedioPago,
    };

    // Limpia Receptor si no tiene nombre (sección deshabilitada)
    const receptor = { ...form.Receptor };
    if (!receptor.Nombre) {
        return stripEmpty({ ...form, Emisor: emisor, Receptor: undefined, ResumenFactura: resumen });
    }
    if (!receptor.Telefono.CodigoPais && !receptor.Telefono.NumTelefono) delete receptor.Telefono;
    const ubR = receptor.Ubicacion;
    if (!ubR.Provincia && !ubR.Canton && !ubR.Distrito && !ubR.OtrasSenas) delete receptor.Ubicacion;
    if (!receptor.NombreComercial) delete receptor.NombreComercial;
    if (!receptor.OtrasSenasExtranjero) delete receptor.OtrasSenasExtranjero;
    if (!receptor.CorreoElectronico) delete receptor.CorreoElectronico;

    return stripEmpty({ ...form, Emisor: emisor, Receptor: receptor, ResumenFactura: resumen });
}
