<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facturación Electrónica</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

    <div class="p-6 flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-semibold mb-1">Facturación Electrónica</h1>
            <p class="text-gray-500 text-sm">Bienvenido</p>
        </div>
        <div class="flex gap-2">
            <a href="/facturacion/json"
               class="px-4 py-2 rounded-md border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Enviar JSON
            </a>
            <a href="/comprobantes"
               class="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Ver Comprobantes
            </a>
        </div>
    </div>

    <div id="invoice-form"></div>
    

</body>
</html>
