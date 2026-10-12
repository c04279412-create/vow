<?php
// VowCrafts Master API Front-Controller & Micro-Router
// Directs all incoming REST requests to their respective resource modules

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/+#', '/', $uri); // Clean slashes

// Remove /api prefix if present
$path = preg_replace('#^/api/#', '', $uri);
$path = trim($path, '/');
$segments = explode('/', $path);
$resource = $segments[0] ?? '';

switch ($resource) {
    case 'settings':
        require __DIR__ . '/settings.php';
        break;

    case 'products':
        if (isset($segments[1]) && !empty($segments[1])) {
            $_GET['id'] = $segments[1];
        }
        require __DIR__ . '/products.php';
        break;

    case 'categories':
        if (isset($segments[1]) && $segments[1] === 'reorder') {
            $_GET['action'] = 'reorder';
        } elseif (isset($segments[1]) && !empty($segments[1])) {
            $_GET['id'] = $segments[1];
        }
        require __DIR__ . '/categories.php';
        break;

    case 'orders':
        if (isset($segments[1]) && !empty($segments[1])) {
            $_GET['id'] = $segments[1];
        }
        require __DIR__ . '/orders.php';
        break;

    case 'marketing':
        require __DIR__ . '/marketing.php';
        break;

    case 'upload':
        require __DIR__ . '/upload.php';
        break;

    case 'auth':
        $sub = $segments[1] ?? 'admin';
        if ($sub === 'admin') {
            $_GET['action'] = 'admin';
        } elseif ($sub === 'customer') {
            $_GET['action'] = 'customer_' . ($segments[2] ?? 'me');
        }
        require __DIR__ . '/auth.php';
        break;

    default:
        require_once __DIR__ . '/config.php';
        sendJson([
            'success' => true,
            'message' => 'VowCrafts PHP REST API is live and operational',
            'endpoints' => [
                '/api/settings',
                '/api/products',
                '/api/categories',
                '/api/orders',
                '/api/marketing',
                '/api/upload',
                '/api/auth/admin'
            ]
        ]);
        break;
}
