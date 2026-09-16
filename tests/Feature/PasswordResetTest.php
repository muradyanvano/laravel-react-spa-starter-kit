<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

test('password reset link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $response = $this->postJson('/forgot-password', [
        'email' => $user->email,
    ]);

    $response->assertOk();
    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset link request validates email', function () {
    $response = $this->postJson('/forgot-password', [
        'email' => 'not-an-email',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['email']);
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->postJson('/forgot-password', [
        'email' => $user->email,
    ]);

    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        $response = $this->postJson('/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertOk();

        expect(Hash::check('new-password', $user->fresh()->password))->toBeTrue();

        return true;
    });
});

test('password cannot be reset with invalid token', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->postJson('/reset-password', [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response->assertUnprocessable();
    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

test('password reset spa route is named for notification urls', function () {
    expect(route('password.reset', ['token' => 'example-token'], false))
        ->toBe('/reset-password/example-token');

    $this->get('/reset-password/example-token?email=jane%40example.com')
        ->assertOk()
        ->assertViewIs('app');
});

test('password broker creates tokens', function () {
    $user = User::factory()->create();

    $token = Password::broker()->createToken($user);

    expect($token)->not->toBeEmpty();
    expect(Password::broker()->tokenExists($user, $token))->toBeTrue();
});
