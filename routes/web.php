<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPA shell
|--------------------------------------------------------------------------
|
| Laravel serves a single Blade shell for all frontend browser routes.
| React Router owns client-side navigation. Backend/API/auth endpoints
| must remain outside this catch-all (api/*, sanctum/*, Fortify POSTs, /up).
|
*/

Route::get('/{path?}', SpaController::class)
    ->where('path', '^(?!api(?:/|$)|sanctum(?:/|$)|up$).*$')
    ->name('spa');
