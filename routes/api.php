<?php

use App\Http\Controllers\Api\V1\CurrentUserController;
use App\Http\Controllers\Api\V1\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', CurrentUserController::class)->name('api.v1.user');

        Route::get('/settings/security', SecurityController::class)
            ->middleware('verified')
            ->name('api.v1.settings.security');
    });
});
