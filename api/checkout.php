<?php
error_reporting(0);
ini_set('display_errors', 0);

session_start();
require_once 'config.php';
header('Content-Type: application/json');

if (empty($_SESSION['cart'])) {
    echo json_encode(['success' => false, 'message' => 'Cart is empty']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$customer_name = trim($input['customer_name'] ?? '');
$customer_email = trim($input['customer_email'] ?? '');
$customer_phone = trim($input['customer_phone'] ?? '');
$delivery_address = trim($input['delivery_address'] ?? '');
$transaction_id = trim($input['transaction_id'] ?? '');

if (empty($customer_name) || empty($customer_email) || empty($customer_phone) || empty($delivery_address) || empty($transaction_id)) {
    echo json_encode(['success' => false, 'message' => 'All fields including Transaction ID are required']);
    exit;
}

$conn = getConnection();
$conn->begin_transaction();

try {
    $total = 0;
    foreach ($_SESSION['cart'] as $item) {
        $total += $item['price'] * $item['quantity'];
    }

    // Insert order with status 'pending' (payment pending verification)
    $stmt = $conn->prepare("INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, total_amount, transaction_id, order_status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("ssssds", $customer_name, $customer_email, $customer_phone, $delivery_address, $total, $transaction_id);
    $stmt->execute();
    $order_id = $stmt->insert_id;
    $stmt->close();

    foreach ($_SESSION['cart'] as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $stmt2 = $conn->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price_per_unit, subtotal) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt2->bind_param("iisidd", $order_id, $item['id'], $item['name'], $item['quantity'], $item['price'], $subtotal);
        $stmt2->execute();
        $stmt2->close();

        // Reduce stock
        $stmt3 = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $stmt3->bind_param("ii", $item['quantity'], $item['id']);
        $stmt3->execute();
        $stmt3->close();
    }

    $conn->commit();
    unset($_SESSION['cart']);
    echo json_encode(['success' => true, 'order_id' => $order_id, 'total' => $total]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
$conn->close();
?>