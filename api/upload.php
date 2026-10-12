<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

// 1. Check for standard multipart file upload
$file = $_FILES['file'] ?? $_FILES['image'] ?? $_FILES['receipt'] ?? null;

if ($file && isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
    $origName = $file['name'];
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    
    // Allowed extensions
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf'];
    if (!in_array($ext, $allowed)) {
        sendJson(['error' => 'Invalid file format. Allowed: ' . implode(', ', $allowed)], 400);
    }
    
    // Safe filename
    $filename = 'img_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
    $targetPath = UPLOADS_DIR . DIRECTORY_SEPARATOR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $publicUrl = '/uploads/' . $filename;
        sendJson([
            'success' => true,
            'url' => $publicUrl,
            'secure_url' => $publicUrl,
            'filename' => $filename,
            'size' => $file['size']
        ], 201);
    } else {
        sendJson(['error' => 'Failed to save uploaded file on server'], 500);
    }
}

// 2. Fallback: Base64 image payload
$body = getJsonInput();
if (!empty($body['image']) || !empty($body['file'])) {
    $dataUrl = $body['image'] ?? $body['file'];
    if (preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
        $ext = strtolower($matches[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
        $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decoded = base64_decode($data);
        if ($decoded !== false) {
            $filename = 'img_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
            $targetPath = UPLOADS_DIR . DIRECTORY_SEPARATOR . $filename;
            if (file_put_contents($targetPath, $decoded)) {
                $publicUrl = '/uploads/' . $filename;
                sendJson([
                    'success' => true,
                    'url' => $publicUrl,
                    'secure_url' => $publicUrl,
                    'filename' => $filename
                ], 201);
            }
        }
    }
}

sendJson(['error' => 'No valid file received'], 400);
