<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\SpaController;
use App\Http\Controllers\TwoFactorChallengeSpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Named auth browser routes
|--------------------------------------------------------------------------
|
| Fortify password-reset emails require a named `password.reset` route.
| Laravel's Authenticate middleware also expects a named `login` route.
| EnsureEmailIsVerified redirects to `verification.notice` when views are
| disabled. With Fortify views disabled, these serve the SPA shell.
|
*/

Route::get('/login', SpaController::class)->name('login');

Route::get('/reset-password/{token}', SpaController::class)
    ->name('password.reset');

Route::get('/confirm-password', SpaController::class)
    ->middleware('auth')
    ->name('password.confirm');

Route::get('/verify-email', SpaController::class)
    ->middleware('auth')
    ->name('verification.notice');

Route::get('/two-factor-challenge', TwoFactorChallengeSpaController::class)
    ->middleware('guest')
    ->name('two-factor.login');

/*
| Account deletion requires authentication and current-password confirmation.
| Unlike the official Inertia kit (which also gates destroy behind verified),
| unverified users may delete their own account so they can remove personal
| data without completing email verification first.
*/
Route::middleware(['auth'])->group(function (): void {
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
| verification URLs under /email/verify/{id}/{hash} and local disk
| serving under /storage/{path}.
|
*/

Route::get('/{path?}', SpaController::class)
    ->where('path', '^(?!api(?:/|$)|sanctum(?:/|$)|up$|email(?:/|$)|storage(?:/|$)).*$')
    ->name('spa');
