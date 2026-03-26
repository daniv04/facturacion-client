<?php

namespace App\Http\Controllers;


use MythicByte\MythicByteFacturacion\Facades\Facturacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FacturacionController extends Controller
{

    public function index()
    {
        return view('facturacion', ['name' => 'Daniel']);
    }

    public function receipts()
    {
        return view('receipts');
    }

    public function jsonForm()
    {
        return view('facturacion_json');
    }

    public function storeJson(Request $request)
    {
        $tipo    = $request->input('tipo', 'FE');
        $payload = $request->input('payload', []);

        $response = Facturacion::createAndSend($tipo, $payload);

        return response()->json([
            ...(array) $response,
            'redirect' => route('receipts.index'),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->all();

        $response = Facturacion::createAndSend('FE', $payload);

        return response()->json([
            ...(array) $response,
            'redirect' => route('receipts.index'),
        ]);
    }
}
