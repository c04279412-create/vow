<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$state = getStoreState();
if (!isset($state['orders']) || !is_array($state['orders'])) {
    $state['orders'] = [];
}
if (!isset($state['customers']) || !is_array($state['customers'])) {
    $state['customers'] = [];
}

$id = $_GET['id'] ?? null;

// GET Orders
if ($method === 'GET') {
    if (!empty($id)) {
        foreach ($state['orders'] as $ord) {
            if (($ord['id'] ?? '') === $id || ($ord['orderNumber'] ?? '') === $id) {
                sendJson(['success' => true, 'order' => $ord]);
            }
        }
        sendJson(['error' => 'Order not found'], 404);
    }
    
    sendJson([
        'success' => true,
        'orders' => $state['orders'],
        'count' => count($state['orders'])
    ]);
}

// POST: Create Order
if ($method === 'POST') {
    $body = getJsonInput();
    
    $orderId = 'ord-' . round(microtime(true) * 1000);
    $orderNumber = 'VC-' . strtoupper(substr(uniqid(), -6));
    
    $orderData = array_merge([
        'id' => $orderId,
        'orderNumber' => $orderNumber,
        'status' => 'pending',
        'paymentStatus' => 'pending',
        'createdAt' => date('c'),
        'items' => [],
        'totalAmount' => 0,
        'customer' => []
    ], $body);
    
    // Save to orders list (prepend to front)
    array_unshift($state['orders'], $orderData);
    
    // Track customer record if phone or email provided
    $custEmail = $orderData['customer']['email'] ?? null;
    $custPhone = $orderData['customer']['phone'] ?? null;
    $custName = $orderData['customer']['name'] ?? 'Patron';
    
    if ($custEmail || $custPhone) {
        $foundCust = false;
        foreach ($state['customers'] as &$c) {
            if (($custEmail && ($c['email'] ?? '') === $custEmail) || ($custPhone && ($c['phone'] ?? '') === $custPhone)) {
                $c['totalOrders'] = ($c['totalOrders'] ?? 1) + 1;
                $c['lastOrderAt'] = date('c');
                $foundCust = true;
                break;
            }
        }
        if (!$foundCust) {
            $state['customers'][] = [
                'id' => 'cust-' . uniqid(),
                'name' => $custName,
                'email' => $custEmail,
                'phone' => $custPhone,
                'totalOrders' => 1,
                'createdAt' => date('c'),
                'lastOrderAt' => date('c')
            ];
        }
    }
    
    saveStoreState($state);
    
    sendJson([
        'success' => true,
        'message' => 'Order placed successfully',
        'order' => $orderData
    ], 201);
}

// PUT: Update Order (Status, Tracking, Payment Proof, Notes)
if ($method === 'PUT') {
    $body = getJsonInput();
    $targetId = $id ?? ($body['id'] ?? null);
    
    if (empty($targetId)) {
        sendJson(['error' => 'Order ID is required for update'], 400);
    }
    
    $found = false;
    foreach ($state['orders'] as $index => $ord) {
        if (($ord['id'] ?? '') === $targetId || ($ord['orderNumber'] ?? '') === $targetId) {
            $state['orders'][$index] = array_merge($ord, $body, ['updatedAt' => date('c')]);
            $found = true;
            $updatedOrder = $state['orders'][$index];
            break;
        }
    }
    
    if ($found) {
        saveStoreState($state);
        sendJson([
            'success' => true,
            'message' => 'Order updated successfully',
            'order' => $updatedOrder
        ]);
    }
    
    sendJson(['error' => 'Order not found for update'], 404);
}

// DELETE: Cancel / Remove Order
if ($method === 'DELETE') {
    if (empty($id)) {
        sendJson(['error' => 'Order ID is required for deletion'], 400);
    }
    
    $initialCount = count($state['orders']);
    $state['orders'] = array_values(array_filter($state['orders'], function($o) use ($id) {
        return ($o['id'] ?? '') !== $id && ($o['orderNumber'] ?? '') !== $id;
    }));
    
    if (count($state['orders']) < $initialCount) {
        saveStoreState($state);
        sendJson(['success' => true, 'message' => 'Order deleted successfully']);
    }
    
    sendJson(['error' => 'Order not found'], 404);
}

sendJson(['error' => 'Method not allowed'], 405);
