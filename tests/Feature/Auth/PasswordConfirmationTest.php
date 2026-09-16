<?php

use App\Models\User;

test('confirm password spa shell can be rendered for authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('password.confirm'))
        ->assertOk()
        ->assertViewIs('app');
});

test('password confirmation requires authentication', function () {
    $this->get(route('password.confirm'))
        ->assertRedirect(route('login'));
});

test('users can confirm their password', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/user/confirm-password', [
            'password' => 'password',
        ])
        ->assertSuccessful();
});

test('password confirmation rejects invalid passwords', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/user/confirm-password', [
            'password' => 'wrong-password',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});

test('confirmed password status endpoint reports confirmation state', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/confirmed-password-status')
        ->assertOk()
        ->assertJson(['confirmed' => true]);
});
