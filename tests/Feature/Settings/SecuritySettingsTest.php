<?php

use App\Models\User;
use Database\Factories\PasskeyFactory;

test('authenticated verified users can fetch security settings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/settings/security')
        ->assertOk()
        ->assertJsonPath('data.canManageTwoFactor', true)
        ->assertJsonPath('data.canManagePasskeys', true)
        ->assertJsonPath('data.twoFactorEnabled', false)
        ->assertJsonPath('data.requiresConfirmation', true)
        ->assertJsonStructure(['data' => ['passwordRules']]);
});

test('security settings report enabled two-factor status', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/settings/security')
        ->assertOk()
        ->assertJsonPath('data.twoFactorEnabled', true);
});

test('guests cannot fetch security settings', function () {
    $this->getJson('/api/v1/settings/security')->assertUnauthorized();
});

test('unverified users cannot fetch security settings', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/settings/security')
        ->assertForbidden();
});

test('security settings expose passkey capability without embedding passkeys', function () {
    $user = User::factory()->create();
    PasskeyFactory::new()->for($user)->create();

    $response = $this->actingAs($user)
        ->getJson('/api/v1/settings/security')
        ->assertOk()
        ->assertJsonPath('data.canManagePasskeys', true);

    expect($response->json('data'))->not->toHaveKey('passkeys');
    expect(json_encode($response->json()))->not->toContain('credential');
});
