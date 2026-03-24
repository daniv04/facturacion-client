import { useState } from 'react';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

const TIPOS_IDENTIFICACION = [
    { value: '01', label: '01 — Cédula Física' },
    { value: '02', label: '02 — Cédula Jurídica' },
    { value: '03', label: '03 — DIMEX' },
    { value: '04', label: '04 — NITE' },
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

export default function EmisorSection({ data, errors, onChange }) {
    const [showUbicacion, setShowUbicacion] = useState(false);
    const [showTelefono, setShowTelefono]   = useState(false);

    // err(key) → saca el primer mensaje de error del campo, si hay
    const err = (key) => errors[key]?.[0] ?? null;

    function handleUbicacionToggle(checked) {
        setShowUbicacion(checked);
        if (!checked) {
            onChange('Emisor.Ubicacion', {
                Provincia: '', Canton: '', Distrito: '', Barrio: '', OtrasSenas: '',
            });
        }
    }

    function handleTelefonoToggle(checked) {
        setShowTelefono(checked);
        if (!checked) {
            onChange('Emisor.Telefono', { CodigoPais: '', NumTelefono: '' });
        }
    }

    function addEmail() {
        if (data.CorreoElectronico.length < 4) {
            onChange('Emisor.CorreoElectronico', [...data.CorreoElectronico, '']);
        }
    }

    function removeEmail(index) {
        const next = data.CorreoElectronico.filter((_, i) => i !== index);
        onChange('Emisor.CorreoElectronico', next.length ? next : ['']);
    }

    function updateEmail(index, value) {
        const next = [...data.CorreoElectronico];
        next[index] = value;
        onChange('Emisor.CorreoElectronico', next);
    }

    return (
        <section className="space-y-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pb-2 border-b border-gray-200 dark:border-gray-700">
                Emisor
            </h3>

            {/* Nombre + Nombre Comercial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    id="emisor-nombre"
                    label="Nombre *"
                    value={data.Nombre}
                    onChange={e => onChange('Emisor.Nombre', e.target.value)}
                    error={err('Emisor.Nombre')}
                    maxLength={100}
                    placeholder="Razón social o nombre completo"
                />
                <FormInput
                    id="emisor-nombre-comercial"
                    label="Nombre Comercial"
                    value={data.NombreComercial}
                    onChange={e => onChange('Emisor.NombreComercial', e.target.value)}
                    error={err('Emisor.NombreComercial')}
                    maxLength={80}
                    placeholder="Nombre de fantasía (opcional)"
                />
            </div>

            {/* Identificación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect
                    id="emisor-id-tipo"
                    label="Tipo Identificación *"
                    value={data.Identificacion.Tipo}
                    onChange={e => onChange('Emisor.Identificacion.Tipo', e.target.value)}
                    options={TIPOS_IDENTIFICACION}
                    error={err('Emisor.Identificacion.Tipo')}
                />
                <div className="md:col-span-2">
                    <FormInput
                        id="emisor-id-numero"
                        label="Número de Identificación *"
                        value={data.Identificacion.Numero}
                        onChange={e => onChange('Emisor.Identificacion.Numero', e.target.value)}
                        error={err('Emisor.Identificacion.Numero')}
                        maxLength={20}
                        placeholder="Sin guiones ni espacios"
                    />
                </div>
            </div>


            {/* Correos Electrónicos */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Correo(s) Electrónico(s) *{' '}
                    <span className="font-normal text-gray-400">máx. 4</span>
                </p>

                {data.CorreoElectronico.map((email, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <div className="flex-1">
                            <FormInput
                                id={`emisor-email-${i}`}
                                type="email"
                                value={email}
                                onChange={e => updateEmail(i, e.target.value)}
                                placeholder="correo@ejemplo.com"
                                error={err(`Emisor.CorreoElectronico.${i}`)}
                            />
                        </div>
                        {data.CorreoElectronico.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeEmail(i)}
                                className="mt-1.5 p-1.5 text-red-400 hover:text-red-600 rounded transition-colors"
                                title="Eliminar correo"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}

                {data.CorreoElectronico.length < 4 && (
                    <button
                        type="button"
                        onClick={addEmail}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        + Agregar correo
                    </button>
                )}
            </div>

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
                            id="emisor-tel-codigo"
                            label="Código de País *"
                            type="number"
                            value={data.Telefono.CodigoPais}
                            onChange={e => onChange('Emisor.Telefono.CodigoPais', e.target.value)}
                            error={err('Emisor.Telefono.CodigoPais')}
                            placeholder="506"
                            min={1}
                            max={999}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                id="emisor-tel-numero"
                                label="Número de Teléfono *"
                                type="tel"
                                value={data.Telefono.NumTelefono}
                                onChange={e => onChange('Emisor.Telefono.NumTelefono', e.target.value)}
                                error={err('Emisor.Telefono.NumTelefono')}
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
                            id="emisor-provincia"
                            label="Provincia *"
                            value={data.Ubicacion.Provincia}
                            onChange={e => onChange('Emisor.Ubicacion.Provincia', e.target.value)}
                            options={PROVINCIAS}
                            error={err('Emisor.Ubicacion.Provincia')}
                        />
                        <FormInput
                            id="emisor-canton"
                            label="Cantón * (2 dígitos)"
                            value={data.Ubicacion.Canton}
                            onChange={e => onChange('Emisor.Ubicacion.Canton', e.target.value)}
                            error={err('Emisor.Ubicacion.Canton')}
                            placeholder="01"
                            maxLength={2}
                        />
                        <FormInput
                            id="emisor-distrito"
                            label="Distrito * (2 dígitos)"
                            value={data.Ubicacion.Distrito}
                            onChange={e => onChange('Emisor.Ubicacion.Distrito', e.target.value)}
                            error={err('Emisor.Ubicacion.Distrito')}
                            placeholder="01"
                            maxLength={2}
                        />
                        <FormInput
                            id="emisor-barrio"
                            label="Barrio"
                            value={data.Ubicacion.Barrio}
                            onChange={e => onChange('Emisor.Ubicacion.Barrio', e.target.value)}
                            error={err('Emisor.Ubicacion.Barrio')}
                            maxLength={80}
                            placeholder="Opcional"
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                id="emisor-otras-senas"
                                label="Otras Señas *"
                                value={data.Ubicacion.OtrasSenas}
                                onChange={e => onChange('Emisor.Ubicacion.OtrasSenas', e.target.value)}
                                error={err('Emisor.Ubicacion.OtrasSenas')}
                                maxLength={250}
                                placeholder="Dirección completa, referencias..."
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
