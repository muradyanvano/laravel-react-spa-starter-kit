<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Http\Resources\PasskeyResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PasskeysController extends Controller
{
    /**
     * Return safe passkey metadata for the authenticated user.
     */
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $passkeys = $request->user()
            ->passkeys()
            ->select(['id', 'name', 'credential', 'created_at', 'last_used_at'])
            ->latest()
            ->get();

        return PasskeyResource::collection($passkeys);
    }
}
