import { useState } from 'react';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

const TIPOS_IDENTIFICACION = [
    { value: '01', label: '01 — Cédula Física' },
    { value: '02', label: '02 — Cédula Jurídica' },
    { value: '03', label: '03 — DIMEX' },
    { value: '04', label: '04 — NITE' },
    { value: '05', label: '05 — Extranjero' },
];

const PROVINCIAS = [
    { value: '',  label: 'Seleccione...' },
    { value: '1', label: '1 — San José' },
    { value: '2', label: '2 — Alajuela' },
    { value: '3', label: '3 — Cartago' },
    { value: '4', label: '4 — Heredia' },
    { value: '5', label: '5 — Guanacaste' },
    { value: '6', label: '6 — Puntarenas' },
    { value: '7', label: '7 — Limón' },
];

export default function ReceptorSection({ data, errors, onChange }) {
    const [showReceptor, setShowReceptor]   = useState(false);
    const [showUbicacion, setShowUbicacion] = useState(false);
    const [showTelefono, setShowTelefono]   = useState(false);

    const err = (key) => errors[key]?.[0] ?? null;

    const esExtranjero = data.Identificacion.Tipo === '05';

    function handleReceptorToggle(checked) {
        setShowReceptor(checked);
        if (!checked) {
            // Limpia todo el Receptor al deshabilitarlo
            onChange('Receptor', {
                Nombre: '',
                Identificacion: { Tipo: '01', Numero: '' },
                NombreComercial: '',
                OtrasSenasExtranjero: '',
                Ubicacion: { Provincia: '', Canton: '', Distrito: '', Barrio: '', OtrasSenas: '' },
                Telefono: { CodigoPais: '', NumTelefono: '' },
                CorreoElectronico: '',
            });
            setShowUbicacion(false);
            setShowTelefono(false);
        }
    }

    function handleUbicacionToggle(checked) {
        setShowUbicacion(checked);
        if (!checked) {
            onChange('Receptor.Ubicacion', {
                Provincia: '', Canton: '', Distrito: '', Barrio: '', OtrasSenas: '',
            });
        }
    }

    function handleTelefonoToggle(checked) {
        setShowTelefono(checked);
        if (!checked) {
            onChange('Receptor.Telefono', { CodigoPais: '', NumTelefono: '' });
        }
    }

    function handleTipoChange(tipo) {
        onChange('Receptor.Identificacion.Tipo', tipo);
        // Si cambia de Extranjero a otro tipo, limpia el campo extranjero
        if (tipo !== '05') {
            onChange('Receptor.OtrasSenasExtranjero', '');
        }
    }

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Receptor
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showReceptor}
                        onChange={e => handleReceptorToggle(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Agregar receptor</span>
                </label>
            </div>

            {!showReceptor && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    Sin receptor (comprobante al consumidor final).
                </p>
            )}

            {showReceptor && (
                <div className="space-y-5">
                    {/* Nombre + Nombre Comercial */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            id="receptor-nombre"
                            label="Nombre *"
                            value={data.Nombre}
                            onChange={e => onChange('Receptor.Nombre', e.target.value)}
                            error={err('Receptor.Nombre')}
                            maxLength={100}
                            placeholder="Nombre completo o razón social"
                        />
                        <FormInput
                            id="receptor-nombre-comercial"
                            label="Nombre Comercial"
                            value={data.NombreComercial}
                            onChange={e => onChange('Receptor.NombreComercial', e.target.value)}
                            error={err('Receptor.NombreComercial')}
                            maxLength={80}
                            placeholder="Opcional"
                        />
                    </div>

                    {/* Identificación */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect
                            id="receptor-id-tipo"
                            label="Tipo Identificación *"
                            value={data.Identificacion.Tipo}
                            onChange={e => handleTipoChange(e.target.value)}
                            options={TIPOS_IDENTIFICACION}
                            error={err('Receptor.Identificacion.Tipo')}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                id="receptor-id-numero"
                                label="Número de Identificación *"
                                value={data.Identificacion.Numero}
                                onChange={e => onChange('Receptor.Identificacion.Numero', e.target.value)}
                                error={err('Receptor.Identificacion.Numero')}
                                maxLength={20}
                                placeholder="Sin guiones ni espacios"
                            />
                        </div>
                    </div>

                    {/* Otras Señas Extranjero — solo si Tipo = 05 */}
                    {esExtranjero && (
                        <FormInput
                            id="receptor-otras-senas-extranjero"
                            label="Otras Señas Extranjero *"
                            value={data.OtrasSenasExtranjero}
                            onChange={e => onChange('Receptor.OtrasSenasExtranjero', e.target.value)}
                            error={err('Receptor.OtrasSenasExtranjero')}
                            maxLength={160}
                            placeholder="Dirección o referencia en el extranjero"
                        />
                    )}

                    {/* Correo Electrónico */}
                    <FormInput
                        id="receptor-email"
                        label="Correo Electrónico"
                        type="email"
                        value={data.CorreoElectronico}
                        onChange={e => onChange('Receptor.CorreoElectronico', e.target.value)}
                        error={err('Receptor.CorreoElectronico')}
                        maxLength={160}
                        placeholder="correo@ejemplo.com (opcional)"
                    />

                    {/* Teléfono (opcional) */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={showTelefono}
                                onChange={e => handleTelefonoToggle(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Agregar teléfono
                            </span>
                        </label>

                        {showTelefono && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 pt-1">
                                <FormInput
                                    id="receptor-tel-codigo"
                                    label="Código de País *"
                                    type="number"
                                    value={data.Telefono.CodigoPais}
                                    onChange={e => onChange('Receptor.Telefono.CodigoPais', e.target.value)}
                                    error={err('Receptor.Telefono.CodigoPais')}
                                    placeholder="506"
                                    min={1}
                                    max={999}
                                />
                                <div className="md:col-span-2">
                                    <FormInput
                                        id="receptor-tel-numero"
                                        label="Número de Teléfono *"
                                        type="tel"
                                        value={data.Telefono.NumTelefono}
                                        onChange={e => onChange('Receptor.Telefono.NumTelefono', e.target.value)}
                                        error={err('Receptor.Telefono.NumTelefono')}
                                        placeholder="88887777"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ubicación (opcional) */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={showUbicacion}
                                onChange={e => handleUbicacionToggle(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Agregar ubicación
                            </span>
                        </label>

                        {showUbicacion && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pt-1">
                                <FormSelect
                                    id="receptor-provincia"
                                    label="Provincia *"
                                    value={data.Ubicacion.Provincia}
                                    onChange={e => onChange('Receptor.Ubicacion.Provincia', e.target.value)}
                                    options={PROVINCIAS}
                                    error={err('Receptor.Ubicacion.Provincia')}
                                />
                                <FormInput
                                    id="receptor-canton"
                                    label="Cantón * (2 dígitos)"
                                    value={data.Ubicacion.Canton}
                                    onChange={e => onChange('Receptor.Ubicacion.Canton', e.target.value)}
                                    error={err('Receptor.Ubicacion.Canton')}
                                    placeholder="01"
                                    maxLength={2}
                                />
                                <FormInput
                                    id="receptor-distrito"
                                    label="Distrito * (2 dígitos)"
                                    value={data.Ubicacion.Distrito}
                                    onChange={e => onChange('Receptor.Ubicacion.Distrito', e.target.value)}
                                    error={err('Receptor.Ubicacion.Distrito')}
                                    placeholder="01"
                                    maxLength={2}
                                />
                                <FormInput
                                    id="receptor-barrio"
                                    label="Barrio"
                                    value={data.Ubicacion.Barrio}
                                    onChange={e => onChange('Receptor.Ubicacion.Barrio', e.target.value)}
                                    error={err('Receptor.Ubicacion.Barrio')}
                                    maxLength={50}
                                    placeholder="Opcional"
                                />
                                <div className="md:col-span-2">
                                    <FormInput
                                        id="receptor-otras-senas"
                                        label="Otras Señas *"
                                        value={data.Ubicacion.OtrasSenas}
                                        onChange={e => onChange('Receptor.Ubicacion.OtrasSenas', e.target.value)}
                                        error={err('Receptor.Ubicacion.OtrasSenas')}
                                        maxLength={160}
                                        placeholder="Dirección completa, referencias..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
