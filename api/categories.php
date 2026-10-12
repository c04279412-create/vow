<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$state = getStoreState();
if (!isset($state['categories']) || !is_array($state['categories'])) {
    $state['categories'] = [];
}

$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// GET All Categories
if ($method === 'GET') {
    if (!empty($id)) {
        foreach ($state['categories'] as $c) {
            if (($c['id'] ?? '') === $id || ($c['slug'] ?? '') === $id) {
                sendJson(['success' => true, 'category' => $c]);
            }
        }
        sendJson(['error' => 'Category not found'], 404);
    }
    
    sendJson([
        'success' => true,
        'categories' => $state['categories']
    ]);
}

// POST: Add Category or Reorder
if ($method === 'POST') {
    $body = getJsonInput();
    
    // Category Reordering
    if ($action === 'reorder' || isset($body['orderedIds']) || isset($body['categories'])) {
        $ordered = $body['categories'] ?? $body['orderedIds'] ?? [];
        if (is_array($ordered) && !empty($ordered)) {
            if (isset($ordered[0]['id'])) {
                $state['categories'] = $ordered;
            } else {
                $idMap = [];
                foreach ($state['categories'] as $cat) {
                    $idMap[$cat['id']] = $cat;
                }
                $newCats = [];
                foreach ($ordered as $cId) {
                    if (isset($idMap[$cId])) {
                        $newCats[] = $idMap[$cId];
                    }
                }
                $state['categories'] = $newCats;
            }
            saveStoreState($state);
            sendJson(['success' => true, 'categories' => $state['categories']]);
        }
    }
    
    // Create new category
    if (empty($body['name'])) {
        sendJson(['error' => 'Category name is required'], 400);
    }
    
    if (empty($body['id'])) {
        $body['id'] = 'cat-' . strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['name'])));
    }
    if (empty($body['slug'])) {
        $body['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $body['name'])));
    }
    
    $state['categories'][] = $body;
    saveStoreState($state);
    
    sendJson([
        'success' => true,
        'message' => 'Category created successfully',
        'category' => $body
    ], 201);
}

// PUT: Update Category
if ($method === 'PUT') {
    $body = getJsonInput();
    $targetId = $id ?? ($body['id'] ?? null);
    
    if (empty($targetId)) {
        sendJson(['error' => 'Category ID is required for update'], 400);
    }
    
    $found = false;
    foreach ($state['categories'] as $index => $cat) {
        if (($cat['id'] ?? '') === $targetId || ($cat['slug'] ?? '') === $targetId) {
            $state['categories'][$index] = array_merge($cat, $body);
            $found = true;
            $updatedCat = $state['categories'][$index];
            break;
        }
    }
    
    if ($found) {
        saveStoreState($state);
        sendJson([
            'success' => true,
            'message' => 'Category updated successfully',
            'category' => $updatedCat
        ]);
    }
    
    sendJson(['error' => 'Category not found for update'], 404);
}

// DELETE: Remove Category
if ($method === 'DELETE') {
    if (empty($id)) {
        sendJson(['error' => 'Category ID is required for deletion'], 400);
    }
    
    $initialCount = count($state['categories']);
    $state['categories'] = array_values(array_filter($state['categories'], function($c) use ($id) {
        return ($c['id'] ?? '') !== $id && ($c['slug'] ?? '') !== $id;
    }));
    
    if (count($state['categories']) < $initialCount) {
        saveStoreState($state);
        sendJson(['success' => true, 'message' => 'Category deleted successfully']);
    }
    
    sendJson(['error' => 'Category not found'], 404);
}

sendJson(['error' => 'Method not allowed'], 405);
