<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Check if order_id and status are provided
if (!isset($input['order_id']) || !isset($input['status'])) {
    echo json_encode(['success' => false, 'message' => 'Order ID and status are required']);
    exit;
}

$order_id = intval($input['order_id']);
$status = $input['status'];

// Validate status
$allowed_status = ['pending', 'processing', 'completed', 'cancelled'];
if (!in_array($status, $allowed_status)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status. Allowed: pending, processing, completed, cancelled']);
    exit;
}

// Update order status
$conn = getConnection();
$stmt = $conn->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $order_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>