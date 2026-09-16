<?php

use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('serves the spa shell for the home route', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertViewIs('app');
    $response->assertSee('id="app"', false);
});

test('serves the spa shell for frontend routes on direct refresh', function (string $path) {
    $response = $this->get($path);

    $response->assertOk();
    $response->assertViewIs('app');
})->with([
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/example-token',
    '/settings/profile',
    '/settings/security',
    '/settings/appearance',
    '/settings/password',
    '/settings/two-factor',
]);

test('serves confirm-password spa shell for authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/confirm-password')
        ->assertOk()
        ->assertViewIs('app');
});

test('serves two-factor-challenge spa shell for guests with pending login', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $this->get('/two-factor-challenge')
        ->assertOk()
        ->assertViewIs('app');
});

test('redirects two-factor-challenge to login without pending challenge', function () {
    $this->get('/two-factor-challenge')
        ->assertRedirect(route('login'));
});

test('does not swallow api routes with the spa fallback', function () {
    $response = $this->getJson('/api/v1/user');

    $response->assertUnauthorized();
    $response->assertJsonMissingPath('id');
});

test('does not swallow sanctum csrf cookie route', function () {
    $response = $this->get('/sanctum/csrf-cookie');

    $response->assertNoContent();
});

test('does not swallow fortify email verification routes', function () {
    $response = $this->get('/email/verify/1/invalid');

    $response->assertRedirect(route('login'));
});

test('health endpoint remains available', function () {
    $this->get('/up')->assertOk();
});

test('serves the spa shell for paths that share a prefix with reserved routes', function () {
    $this->get('/upload')->assertOk()->assertViewIs('app');
    $this->get('/api-docs')->assertOk()->assertViewIs('app');
});

test('does not swallow storage routes with the spa fallback', function () {
    $disk = Storage::disk('local');
    $disk->put('phase5-storage-probe.txt', 'storage-ok');

    // Unsigned private disk URLs must not fall through to the SPA shell.
    $this->get('/storage/phase5-storage-probe.txt')
        ->assertForbidden()
        ->assertDontSee('id="app"', false);

    $signedUrl = $disk->temporaryUrl(
        'phase5-storage-probe.txt',
        now()->addMinutes(5),
    );

    $this->get($signedUrl)
        ->assertOk()
        ->assertStreamedContent('storage-ok');

    $this->get('/storage/missing-phase5-file.txt')
        ->assertForbidden()
        ->assertDontSee('id="app"', false);

    $disk->delete('phase5-storage-probe.txt');
});
