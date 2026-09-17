<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Laravel\Passkeys\Passkey;

/**
 * @mixin Passkey
 */
class PasskeyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array{
     *     id: int,
     *     name: string,
     *     authenticator: string|null,
     *     created_at_diff: string,
     *     last_used_at_diff: string|null
     * }
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'authenticator' => $this->authenticator,
            'created_at_diff' => $this->created_at->diffForHumans(),
            'last_used_at_diff' => $this->last_used_at?->diffForHumans(),
        ];
    }
}
