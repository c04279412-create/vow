<?php
// VowCrafts PHP Backend - Configuration & Common Utilities
// Works standalone with JSON data store and is 100% compatible with Hostinger Apache/PHP

// 1. CORS & Response Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS requests
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Data Store Paths
define('DATA_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data');
define('DATA_FILE', DATA_DIR . DIRECTORY_SEPARATOR . 'store_state.json');
define('UPLOADS_DIR', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads');

// Ensure directories exist
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// 3. Helper Functions
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit();
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function getStoreState() {
    if (!file_exists(DATA_FILE)) {
        return [
            'settings' => [],
            'products' => [],
            'categories' => [],
            'orders' => [],
            'marketing' => [
                'banners' => [],
                'coupons' => [],
                'reviews' => []
            ],
            'customers' => []
        ];
    }
    $content = file_get_contents(DATA_FILE);
    $decoded = json_decode($content, true);
    if (!is_array($decoded)) {
        return [];
    }
    return $decoded;
}

function saveStoreState($state) {
    $json = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    file_put_contents(DATA_FILE, $json, LOCK_EX);
    return true;
}
