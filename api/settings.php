<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$state = getStoreState();

if ($method === 'GET') {
    sendJson([
        'success' => true,
        'settings' => $state['settings'] ?? []
    ]);
}

if ($method === 'POST') {
    $body = getJsonInput();
    if (!isset($state['settings']) || !is_array($state['settings'])) {
        $state['settings'] = [];
    }
    
    // Merge updated settings
    $state['settings'] = array_merge($state['settings'], $body);
    saveStoreState($state);
    
    sendJson([
        'success' => true,
        'message' => 'Store settings updated successfully',
        'settings' => $state['settings']
    ]);
}

sendJson(['error' => 'Method not allowed'], 405);
