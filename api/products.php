<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$state = getStoreState();
if (!isset($state['products']) || !is_array($state['products'])) {
    $state['products'] = [];
}

// Extract ID from query param or URL
$id = $_GET['id'] ?? $_GET['slug'] ?? null;

// GET All or Single Product
if ($method === 'GET') {
    if (!empty($id)) {
        foreach ($state['products'] as $p) {
            if (($p['id'] ?? '') === $id || ($p['slug'] ?? '') === $id) {
                sendJson([
                    'success' => true,
                    'product' => $p
                ]);
            }
        }
        sendJson(['error' => 'Product not found'], 404);
    }
    
    sendJson([
        'success' => true,
        'products' => $state['products']
    ]);
}

// POST: Create New Product
if ($method === 'POST') {
    $body = getJsonInput();
    if (empty($body['name'])) {
        sendJson(['error' => 'Product name is required'], 400);
    }
    
    if (empty($body['id'])) {
        $body['id'] = 'prod-' . time() . '-' . rand(100, 999);
    }
    if (empty($body['slug'])) {
        $body['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['name'])));
    }
    
    $state['products'][] = $body;
    saveStoreState($state);
    
    sendJson([
        'success' => true,
        'message' => 'Product created successfully',
        'product' => $body
    ], 201);
}

// PUT: Update Product
if ($method === 'PUT') {
    $body = getJsonInput();
    $targetId = $id ?? ($body['id'] ?? null);
    
    if (empty($targetId)) {
        sendJson(['error' => 'Product ID is required for update'], 400);
    }
    
    $found = false;
    foreach ($state['products'] as $index => $prod) {
        if (($prod['id'] ?? '') === $targetId || ($prod['slug'] ?? '') === $targetId) {
            $state['products'][$index] = array_merge($prod, $body);
            $found = true;
            $updatedProduct = $state['products'][$index];
            break;
        }
    }
    
    if ($found) {
        saveStoreState($state);
        sendJson([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => $updatedProduct
        ]);
    }
    
    sendJson(['error' => 'Product not found for update'], 404);
}

// DELETE: Remove Product
if ($method === 'DELETE') {
    if (empty($id)) {
        sendJson(['error' => 'Product ID is required for deletion'], 400);
    }
    
    $initialCount = count($state['products']);
    $state['products'] = array_values(array_filter($state['products'], function($p) use ($id) {
        return ($p['id'] ?? '') !== $id && ($p['slug'] ?? '') !== $id;
    }));
    
    if (count($state['products']) < $initialCount) {
        saveStoreState($state);
        sendJson([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
    
    sendJson(['error' => 'Product not found'], 404);
}

sendJson(['error' => 'Method not allowed'], 405);
