<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());
});

test('login returns a two-factor challenge payload when required', function () {
    $user = User::factory()->withTwoFactor()->create([
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])
        ->assertOk()
        ->assertJson(['two_factor' => true]);

    $this->assertGuest();
});

test('two-factor challenge spa shell is available during challenge', function () {
    $user = User::factory()->withTwoFactor()->create([
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $this->get(route('two-factor.login'))
        ->assertOk()
        ->assertViewIs('app');
});

test('two-factor challenge spa shell is available to guests', function () {
    $this->get(route('two-factor.login'))
        ->assertOk()
        ->assertViewIs('app');
});

test('invalid authenticator codes are rejected', function () {
    $user = User::factory()->withTwoFactor()->create([
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $this->postJson('/two-factor-challenge', [
        'code' => '000000',
    ])->assertUnprocessable();

    $this->assertGuest();
});

test('invalid recovery codes are rejected', function () {
    $user = User::factory()->withTwoFactor()->create([
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $this->postJson('/two-factor-challenge', [
        'recovery_code' => 'invalid-code',
    ])->assertUnprocessable();

    $this->assertGuest();
});

test('valid recovery codes complete authentication', function () {
    $user = User::factory()->withTwoFactor()->create([
        'password' => Hash::make('password'),
    ]);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $this->postJson('/two-factor-challenge', [
        'recovery_code' => 'recovery-code-1',
    ])->assertSuccessful();

    $this->assertAuthenticatedAs($user);
});
