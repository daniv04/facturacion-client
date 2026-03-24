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

    public function store(Request $request)
    {
        
        $payload = $request->all();

        
        
        
        $response = Facturacion::createAndSend('FE', $payload);
        
        return response()->json($response);
    }
}
