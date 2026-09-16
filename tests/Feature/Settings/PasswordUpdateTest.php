<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('authenticated users can update their password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->actingAs($user)
        ->putJson('/user/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertSuccessful();

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('password update requires the correct current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->actingAs($user)
        ->putJson('/user/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['current_password']);
});

test('password update validates confirmation', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->actingAs($user)
        ->putJson('/user/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'mismatch',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});

test('guests cannot update passwords', function () {
    $this->putJson('/user/password', [
        'current_password' => 'password',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertUnauthorized();
});
