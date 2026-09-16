<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Return security settings state for the SPA settings page.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $canManageTwoFactor = Features::canManageTwoFactorAuthentication();

        $payload = [
            'canManageTwoFactor' => $canManageTwoFactor,
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'twoFactorEnabled' => false,
            'requiresConfirmation' => false,
        ];

        if ($canManageTwoFactor) {
            $payload['twoFactorEnabled'] = $request->user()->hasEnabledTwoFactorAuthentication();
            $payload['requiresConfirmation'] = Features::optionEnabled(
                Features::twoFactorAuthentication(),
                'confirm',
            );
        }

        return response()->json(['data' => $payload]);
    }
}
