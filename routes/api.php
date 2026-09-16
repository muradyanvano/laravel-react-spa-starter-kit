<?php

use App\Http\Controllers\Api\V1\CurrentUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', CurrentUserController::class)->name('api.v1.user');
    });
});
