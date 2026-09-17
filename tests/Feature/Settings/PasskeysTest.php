<?php

use App\Models\User;
use Database\Factories\PasskeyFactory;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Laravel\Passkeys\Http\Controllers\PasskeyLoginController;
use Laravel\Passkeys\Passkey;

test('fortify passkeys feature is enabled', function () {
    expect(Features::enabled(Features::passkeys()))->toBeTrue();
    expect(Features::canManagePasskeys())->toBeTrue();
});

test('native passkey routes are registered', function () {
    expect(Route::has('passkey.login-options'))->toBeTrue();
    expect(Route::has('passkey.login'))->toBeTrue();
    expect(Route::has('passkey.confirm-options'))->toBeTrue();
    expect(Route::has('passkey.confirm'))->toBeTrue();
    expect(Route::has('passkey.registration-options'))->toBeTrue();
    expect(Route::has('passkey.store'))->toBeTrue();
    expect(Route::has('passkey.destroy'))->toBeTrue();
});

test('passkey login options returns webauthn options json', function () {
    $this->getJson('/passkeys/login/options')
        ->assertOk()
        ->assertJsonStructure(['options']);
});

test('passkey registration options requires authentication', function () {
    $this->getJson('/user/passkeys/options')->assertUnauthorized();
});

test('passkey registration options require password confirmation when enabled', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/user/passkeys/options')
        ->assertStatus(423);
});

test('authenticated users with confirmed password can fetch registration options', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/passkeys/options')
        ->assertOk()
        ->assertJsonStructure(['options']);
});

test('passkey registration store requires password confirmation when enabled', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/user/passkeys', [
            'name' => 'Test Passkey',
            'credential' => [],
        ])
        ->assertStatus(423);
});

test('passkey deletion requires password confirmation when enabled', function () {
    $user = User::factory()->create();
    $passkey = PasskeyFactory::new()->for($user)->create();

    $this->actingAs($user)
        ->deleteJson('/user/passkeys/'.$passkey->id)
        ->assertStatus(423);
});

test('passkey confirm options do not require password confirmation', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/passkeys/confirm/options')
        ->assertOk()
        ->assertJsonStructure(['options']);
});

test('guests cannot fetch the passkey settings list endpoint', function () {
    $this->getJson('/api/v1/settings/passkeys')->assertUnauthorized();
});

test('unverified users cannot fetch the passkey settings list endpoint', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/settings/passkeys')
        ->assertForbidden();
});

test('verified users can fetch only their own passkeys', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $ownPasskey = PasskeyFactory::new()->for($userA)->create(['name' => 'Own Passkey']);
    PasskeyFactory::new()->for($userB)->create(['name' => 'Other Passkey']);

    $response = $this->actingAs($userA)
        ->getJson('/api/v1/settings/passkeys')
        ->assertOk();

    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.id'))->toBe($ownPasskey->id);
    expect($response->json('data.0.name'))->toBe('Own Passkey');
});

test('passkey settings list is ordered newest first', function () {
    $user = User::factory()->create();

    $older = PasskeyFactory::new()->for($user)->create([
        'name' => 'Older Passkey',
        'created_at' => now()->subDay(),
    ]);
    $newer = PasskeyFactory::new()->for($user)->create([
        'name' => 'Newer Passkey',
        'created_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/settings/passkeys')
        ->assertOk();

    expect($response->json('data.0.id'))->toBe($newer->id);
    expect($response->json('data.1.id'))->toBe($older->id);
});

test('passkey resource exposes only safe metadata fields', function () {
    $user = User::factory()->create();

    PasskeyFactory::new()->for($user)->recentlyUsed()->create([
        'name' => 'Chrome on Windows',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/settings/passkeys')
        ->assertOk()
        ->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'name',
                    'authenticator',
                    'created_at_diff',
                    'last_used_at_diff',
                ],
            ],
        ]);

    expect($response->json('data.0.name'))->toBe('Chrome on Windows');
    expect($response->json('data.0.created_at_diff'))->toBeString()->not->toBeEmpty();
    expect($response->json('data.0.last_used_at_diff'))->toBeString()->not->toBeEmpty();
});

test('passkey resource never exposes credential material', function () {
    $user = User::factory()->create();

    PasskeyFactory::new()->for($user)->create();

    $response = $this->actingAs($user)
        ->getJson('/api/v1/settings/passkeys')
        ->assertOk();

    $payload = json_encode($response->json());

    expect($payload)->not->toContain('credential_id');
    expect($response->json('data.0'))->not->toHaveKey('credential');
    expect($response->json('data.0'))->not->toHaveKey('credential_id');
    expect($response->json('data.0'))->not->toHaveKey('user_handle');
    expect($response->json('data.0'))->not->toHaveKey('user_id');
});

test('users cannot delete another users passkey', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $passkey = PasskeyFactory::new()->for($userB)->create();

    $this->actingAs($userA)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->deleteJson('/user/passkeys/'.$passkey->id)
        ->assertForbidden();

    expect(Passkey::query()->whereKey($passkey->id)->exists())->toBeTrue();
});

test('spa fallback does not swallow passkey login options', function () {
    $this->get('/passkeys/login/options')
        ->assertOk()
        ->assertJsonStructure(['options'])
        ->assertDontSee('id="app"', false);
});

test('spa fallback does not swallow passkey registration options', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get('/user/passkeys/options')
        ->assertOk()
        ->assertJsonStructure(['options'])
        ->assertDontSee('id="app"', false);
});

test('passkey login authenticates directly without the two-factor redirect action', function () {
    $source = file_get_contents(
        (new ReflectionClass(PasskeyLoginController::class))->getFileName()
    );

    expect($source)->toContain('$guard->login($passkey->user');
    expect($source)->not->toContain('RedirectIfTwoFactorAuthenticatable');
});
