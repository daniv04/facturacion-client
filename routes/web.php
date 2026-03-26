<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FacturacionController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/facturacion', [FacturacionController::class, 'index'])->name('facturacion.index');
Route::post('/facturacion', [FacturacionController::class, 'store'])->name('facturacion.store');
Route::get('/comprobantes', [FacturacionController::class, 'receipts'])->name('receipts.index');
Route::get('/facturacion/json', [FacturacionController::class, 'jsonForm'])->name('facturacion.json.form');
Route::post('/facturacion/json', [FacturacionController::class, 'storeJson'])->name('facturacion.json.store');