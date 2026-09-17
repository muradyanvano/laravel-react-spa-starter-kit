<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Support\Aaguids;

/**
 * @extends Factory<Passkey>
 */
class PasskeyFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Passkey>
     */
    protected $model = Passkey::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'credential_id' => Str::random(32),
            'credential' => [
                'aaguid' => Aaguids::unknown(),
            ],
            'last_used_at' => null,
        ];
    }

    /**
     * Indicate that the passkey was used recently.
     */
    public function recentlyUsed(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_used_at' => now()->subHour(),
        ]);
    }
}
