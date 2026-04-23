<?php
session_start();
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$product_id = $input['product_id'] ?? 0;
$quantity = intval($input['quantity'] ?? 0);

if ($quantity <= 0) {
    unset($_SESSION['cart'][$product_id]);
} elseif (isset($_SESSION['cart'][$product_id])) {
    $stock = $_SESSION['cart'][$product_id]['stock'];
    $_SESSION['cart'][$product_id]['quantity'] = min($quantity, $stock);
}
echo json_encode(['success' => true]);