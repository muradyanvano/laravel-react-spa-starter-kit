<?php

use App\Http\Controllers\Settings\ProfileController;
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

Route::get('/confirm-password', SpaController::class)
    ->middleware('auth')
    ->name('password.confirm');

Route::get('/two-factor-challenge', SpaController::class)
    ->middleware('guest')
    ->name('two-factor.login');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::delete('/settings/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

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
