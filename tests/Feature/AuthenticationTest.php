<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('users can register', function () {
    $response = $this->postJson('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertCreated();
    $this->assertAuthenticated();
    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});

test('registration requires valid data', function () {
    $response = $this->postJson('/register', [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'short',
        'password_confirmation' => 'different',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name', 'email', 'password']);
    $this->assertGuest();
});

test('users can authenticate', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSuccessful();
    $this->assertAuthenticatedAs($user);
});

test('users cannot authenticate with invalid password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

test('users can authenticate with remember me', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
        'remember' => true,
    ]);

    $response->assertSuccessful();
    $this->assertAuthenticatedAs($user);
    expect($response->headers->getCookies())->not->toBeEmpty();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->postJson('/logout');

    $response->assertSuccessful();
    $this->assertGuest();
});

test('guest cannot access current user endpoint', function () {
    $this->getJson('/api/v1/user')->assertUnauthorized();
});

test('authenticated user can access current user endpoint', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/user')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonMissingPath('data.password');
});
