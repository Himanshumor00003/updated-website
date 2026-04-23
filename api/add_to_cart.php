<?php
session_start();
require_once 'config.php';
header('Content-Type: application/json');

if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

$input = json_decode(file_get_contents('php://input'), true);
$product_id = $input['product_id'] ?? 0;
$quantity = max(1, intval($input['quantity'] ?? 1));

$conn = getConnection();
$stmt = $conn->prepare("SELECT id, name, price, stock FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();

if (!$product) {
    echo json_encode(['success' => false, 'message' => 'Product not found']);
    exit;
}
if ($product['stock'] < $quantity) {
    echo json_encode(['success' => false, 'message' => 'Insufficient stock']);
    exit;
}

if (isset($_SESSION['cart'][$product_id])) {
    $_SESSION['cart'][$product_id]['quantity'] += $quantity;
} else {
    $_SESSION['cart'][$product_id] = [
        'id' => $product['id'],
        'name' => $product['name'],
        'price' => $product['price'],
        'quantity' => $quantity,
        'stock' => $product['stock']
    ];
}
if ($_SESSION['cart'][$product_id]['quantity'] > $product['stock']) {
    $_SESSION['cart'][$product_id]['quantity'] = $product['stock'];
}

echo json_encode(['success' => true, 'cart_count' => count($_SESSION['cart'])]);