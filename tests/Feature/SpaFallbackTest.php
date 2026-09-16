<?php

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
    '/verify-email',
    '/settings/profile',
    '/settings/password',
    '/settings/appearance',
    '/settings/two-factor',
]);

test('does not swallow api routes with the spa fallback', function () {
    $response = $this->getJson('/api/v1/user');

    $response->assertUnauthorized();
    $response->assertJsonMissingPath('id');
});

test('does not swallow sanctum csrf cookie route', function () {
    $response = $this->get('/sanctum/csrf-cookie');

    $response->assertNoContent();
});

test('serves the spa shell for paths that share a prefix with reserved routes', function () {
    $this->get('/upload')->assertOk()->assertViewIs('app');
    $this->get('/api-docs')->assertOk()->assertViewIs('app');
});
