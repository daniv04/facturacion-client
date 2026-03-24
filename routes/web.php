<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FacturacionController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/facturacion', [FacturacionController::class, 'index'])->name('facturacion.index');
Route::post('/facturacion', [FacturacionController::class, 'store'])->name('facturacion.store');