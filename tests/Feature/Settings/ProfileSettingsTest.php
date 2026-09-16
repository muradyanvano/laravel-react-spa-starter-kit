<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('authenticated users can update their profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->putJson('/user/profile-information', [
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);

    $response->assertSuccessful();

    $user->refresh();

    expect($user->name)->toBe('Updated Name')
        ->and($user->email)->toBe('updated@example.com')
        ->and($user->email_verified_at)->toBeNull();
});

test('profile update validation rejects invalid data', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->putJson('/user/profile-information', [
            'name' => '',
            'email' => 'not-an-email',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email']);
});

test('email verification status is unchanged when email is unchanged', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->putJson('/user/profile-information', [
        'name' => 'Same Email User',
        'email' => $user->email,
    ])->assertSuccessful();

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('guests cannot update profile information', function () {
    $this->putJson('/user/profile-information', [
        'name' => 'Guest',
        'email' => 'guest@example.com',
    ])->assertUnauthorized();
});

test('authenticated verified users can delete their account', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->actingAs($user)->deleteJson('/settings/profile', [
        'password' => 'password',
    ]);

    $response->assertNoContent();
    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('account deletion requires the correct password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->actingAs($user)
        ->deleteJson('/settings/profile', [
            'password' => 'wrong-password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);

    expect($user->fresh())->not->toBeNull();
});

test('guests cannot delete an account', function () {
    $this->deleteJson('/settings/profile', [
        'password' => 'password',
    ])->assertUnauthorized();
});

test('unverified users can delete their own account', function () {
    $user = User::factory()->unverified()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->actingAs($user)->deleteJson('/settings/profile', [
        'password' => 'password',
    ]);

    $response->assertNoContent();
    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});
