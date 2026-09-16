<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class CurrentUserController extends Controller
{
    /**
     * Return the authenticated user for SPA bootstrap and revalidation.
     */
    public function __invoke(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
