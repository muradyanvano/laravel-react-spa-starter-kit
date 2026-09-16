<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Named auth browser routes
|--------------------------------------------------------------------------
|
| Fortify password-reset emails require a named `password.reset` route.
| Laravel's Authenticate middleware also expects a named `login` route.
| With Fortify views disabled, these serve the SPA shell so React Router
| can render the corresponding pages.
|
*/

Route::get('/login', SpaController::class)->name('login');

Route::get('/reset-password/{token}', SpaController::class)
    ->name('password.reset');

/*
|--------------------------------------------------------------------------
| SPA shell
|--------------------------------------------------------------------------
|
| Laravel serves a single Blade shell for frontend browser routes.
| React Router owns client-side navigation. Backend/API/auth endpoints
| must remain outside this catch-all, including Fortify signed email
| verification URLs under /email/verify/{id}/{hash}.
|
*/

Route::get('/{path?}', SpaController::class)
    ->where('path', '^(?!api(?:/|$)|sanctum(?:/|$)|up$|email(?:/|$)).*$')
    ->name('spa');
