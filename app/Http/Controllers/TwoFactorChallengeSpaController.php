<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Http\Requests\TwoFactorLoginRequest;

class TwoFactorChallengeSpaController extends Controller
{
    /**
     * Serve the SPA challenge shell only when Fortify has a pending login.
     */
    public function __invoke(TwoFactorLoginRequest $request): RedirectResponse|View
    {
        if (! $request->hasChallengedUser()) {
            return redirect()->route('login');
        }

        return view('app');
    }
}
