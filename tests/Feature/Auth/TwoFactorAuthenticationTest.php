<?php

use App\Models\User;
use Laravel\Fortify\Features;
use PragmaRX\Google2FA\Google2FA;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());
});

test('guests cannot enable two-factor authentication', function () {
    $this->postJson('/user/two-factor-authentication')->assertUnauthorized();
});

test('users can enable two-factor authentication when password is confirmed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication')
        ->assertSuccessful();

    expect($user->refresh()->two_factor_secret)->not->toBeNull()
        ->and($user->two_factor_confirmed_at)->toBeNull();
});

test('enabling two-factor requires password confirmation', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/user/two-factor-authentication');

    expect($response->status())->toBeIn([302, 423]);
});

test('users can confirm two-factor setup with a valid code', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication')
        ->assertSuccessful();

    $secret = decrypt($user->refresh()->two_factor_secret);
    $validOtp = (new Google2FA)->getCurrentOtp($secret);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/confirmed-two-factor-authentication', [
            'code' => $validOtp,
        ])
        ->assertSuccessful();

    expect($user->refresh()->two_factor_confirmed_at)->not->toBeNull();
});

test('invalid confirmation codes are rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication')
        ->assertSuccessful();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/confirmed-two-factor-authentication', [
            'code' => '000000',
        ])
        ->assertUnprocessable();
});

test('users can fetch qr code and secret after enabling two-factor', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication')
        ->assertSuccessful();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/two-factor-qr-code')
        ->assertOk()
        ->assertJsonStructure(['svg', 'url']);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/two-factor-secret-key')
        ->assertOk()
        ->assertJsonStructure(['secretKey']);
});

test('confirmed users can view and regenerate recovery codes', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/two-factor-recovery-codes')
        ->assertOk()
        ->assertJsonIsArray();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-recovery-codes')
        ->assertSuccessful();
});

test('users can disable two-factor authentication', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->deleteJson('/user/two-factor-authentication')
        ->assertSuccessful();

    $user->refresh();

    expect($user->two_factor_secret)->toBeNull()
        ->and($user->two_factor_confirmed_at)->toBeNull();
});
