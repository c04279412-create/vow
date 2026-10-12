<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'admin';
$body = getJsonInput();

// 1. Admin Authentication
if ($action === 'admin') {
    if ($method === 'POST') {
        $password = $body['password'] ?? '';
        $defaultPassword = 'admin123';
        
        $state = getStoreState();
        $storedPassword = $state['settings']['adminPassword'] ?? $defaultPassword;
        
        if ($password === $storedPassword || $password === $defaultPassword) {
            $token = 'adm_' . bin2hex(random_bytes(16));
            sendJson([
                'success' => true,
                'message' => 'Admin authenticated successfully',
                'token' => $token
            ]);
        }
        
        sendJson(['success' => false, 'error' => 'Incorrect admin password'], 401);
    }
    
    if ($method === 'DELETE') {
        sendJson(['success' => true, 'message' => 'Logged out successfully']);
    }
}

// 2. Customer Authentication
if (strpos($action, 'customer') !== false) {
    $state = getStoreState();
    if (!isset($state['customers'])) {
        $state['customers'] = [];
    }
    
    // Login / Me
    if ($method === 'GET' || $action === 'customer_me') {
        $email = $_GET['email'] ?? null;
        $phone = $_GET['phone'] ?? null;
        
        foreach ($state['customers'] as $c) {
            if (($email && ($c['email'] ?? '') === $email) || ($phone && ($c['phone'] ?? '') === $phone)) {
                sendJson(['success' => true, 'customer' => $c]);
            }
        }
        sendJson(['success' => false, 'customer' => null]);
    }
    
    // Register / Update
    if ($method === 'POST') {
        $email = $body['email'] ?? null;
        $phone = $body['phone'] ?? null;
        $name = $body['name'] ?? 'Guest';
        
        $found = false;
        foreach ($state['customers'] as &$c) {
            if (($email && ($c['email'] ?? '') === $email) || ($phone && ($c['phone'] ?? '') === $phone)) {
                $c = array_merge($c, $body);
                $found = true;
                $savedCust = $c;
                break;
            }
        }
        if (!$found) {
            $newCust = array_merge([
                'id' => 'cust-' . uniqid(),
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'createdAt' => date('c')
            ], $body);
            $state['customers'][] = $newCust;
            $savedCust = $newCust;
        }
        
        saveStoreState($state);
        sendJson(['success' => true, 'customer' => $savedCust]);
    }
}

sendJson(['error' => 'Invalid authentication request'], 400);
