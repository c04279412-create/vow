<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$state = getStoreState();
if (!isset($state['marketing']) || !is_array($state['marketing'])) {
    $state['marketing'] = [
        'banners' => [],
        'coupons' => [],
        'reviews' => []
    ];
}

$resource = $_GET['resource'] ?? null;

// GET Marketing Resources
if ($method === 'GET') {
    if ($resource === 'banners') {
        sendJson(['success' => true, 'banners' => $state['marketing']['banners'] ?? []]);
    }
    if ($resource === 'reviews') {
        sendJson(['success' => true, 'reviews' => $state['marketing']['reviews'] ?? []]);
    }
    if ($resource === 'coupons') {
        sendJson(['success' => true, 'coupons' => $state['marketing']['coupons'] ?? []]);
    }
    
    sendJson([
        'success' => true,
        'marketing' => $state['marketing'],
        'banners' => $state['marketing']['banners'] ?? [],
        'reviews' => $state['marketing']['reviews'] ?? [],
        'coupons' => $state['marketing']['coupons'] ?? []
    ]);
}

// POST: Add or Update Marketing Item
if ($method === 'POST') {
    $body = getJsonInput();
    $targetRes = $resource ?? ($body['resource'] ?? 'banners');
    
    if (!isset($state['marketing'][$targetRes])) {
        $state['marketing'][$targetRes] = [];
    }
    
    // Check if full array is being replaced (e.g. reordering or batch save)
    if (isset($body['items']) && is_array($body['items'])) {
        $state['marketing'][$targetRes] = $body['items'];
    } elseif (isset($body['data'])) {
        $state['marketing'][$targetRes] = $body['data'];
    } else {
        // Single item upsert
        if (empty($body['id'])) {
            $body['id'] = $targetRes . '-' . uniqid();
        }
        $existingIndex = -1;
        foreach ($state['marketing'][$targetRes] as $idx => $item) {
            if (($item['id'] ?? '') === $body['id']) {
                $existingIndex = $idx;
                break;
            }
        }
        if ($existingIndex >= 0) {
            $state['marketing'][$targetRes][$existingIndex] = array_merge($state['marketing'][$targetRes][$existingIndex], $body);
        } else {
            $state['marketing'][$targetRes][] = $body;
        }
    }
    
    saveStoreState($state);
    
    sendJson([
        'success' => true,
        'message' => ucfirst($targetRes) . ' updated successfully',
        'marketing' => $state['marketing']
    ]);
}

// DELETE: Remove Item
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $targetRes = $resource ?? 'banners';
    
    if (!empty($id) && isset($state['marketing'][$targetRes])) {
        $state['marketing'][$targetRes] = array_values(array_filter($state['marketing'][$targetRes], function($it) use ($id) {
            return ($it['id'] ?? '') !== $id;
        }));
        saveStoreState($state);
        sendJson(['success' => true, 'message' => 'Item deleted successfully']);
    }
    
    sendJson(['error' => 'Item ID required'], 400);
}

sendJson(['error' => 'Method not allowed'], 405);
