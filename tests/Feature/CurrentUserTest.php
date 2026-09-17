<?php

use App\Models\User;
use Database\Factories\PasskeyFactory;

test('unauthenticated users cannot access the current user endpoint', function () {
    $response = $this->getJson('/api/v1/user');

    $response->assertUnauthorized();
});

test('authenticated users receive a typed current user resource', function () {
    $user = User::factory()->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);

    $response = $this->actingAs($user)->getJson('/api/v1/user');

    $response->assertOk();
    $response->assertJsonPath('data.id', $user->id);
    $response->assertJsonPath('data.name', 'Jane Doe');
    $response->assertJsonPath('data.email', 'jane@example.com');
    $response->assertJsonStructure([
        'data' => [
            'id',
            'name',
            'email',
            'email_verified_at',
        ],
    ]);
});

test('current user resource does not expose sensitive attributes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/v1/user');

    $response->assertOk();
    $response->assertJsonMissingPath('data.password');
    $response->assertJsonMissingPath('data.remember_token');
    $response->assertJsonMissingPath('data.two_factor_secret');
    $response->assertJsonMissingPath('data.two_factor_recovery_codes');
    expect($response->json('data'))->not->toHaveKey('password');
    expect($response->json())->not->toHaveKey('password');
});

test('current user resource does not expose passkey data', function () {
    $user = User::factory()->create();
    PasskeyFactory::new()->for($user)->create();

    $response = $this->actingAs($user)->getJson('/api/v1/user');

    $response->assertOk();
    $response->assertJsonMissingPath('data.passkeys');
    $response->assertJsonMissingPath('data.credential');
    $response->assertJsonMissingPath('data.credential_id');
    $response->assertJsonMissingPath('data.user_handle');
    expect(json_encode($response->json()))->not->toContain('credential_id');
});
