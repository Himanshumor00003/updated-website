<?php
require_once 'config.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_email = $_SESSION['user_email'];
$conn = getConnection();

$stmt = $conn->prepare("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC");
$stmt->bind_param("s", $user_email);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

echo json_encode(['success' => true, 'data' => $orders]);
$stmt->close();
$conn->close();
?>