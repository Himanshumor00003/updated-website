<?php
session_start();
header('Content-Type: application/json');

$cart = $_SESSION['cart'] ?? [];
$total = 0;
foreach ($cart as $item) {
    $total += $item['price'] * $item['quantity'];
}
echo json_encode([
    'success' => true,
    'items' => array_values($cart),
    'total' => $total,
    'count' => count($cart)
]);