<?php

test('spa home responds successfully', function () {
    $response = $this->get('/');

    $response->assertOk();
});
