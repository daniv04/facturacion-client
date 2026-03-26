<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enviar JSON — Facturación Electrónica</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">

    <div class="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div>
            <h1 class="text-2xl font-semibold mb-1">Facturación Electrónica</h1>
            <p class="text-gray-500 text-sm">Envío por JSON</p>
        </div>
        <a href="/comprobantes"
           class="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            Ver Comprobantes
        </a>
    </div>

    <div id="json-invoice-form"></div>

</body>
</html>
