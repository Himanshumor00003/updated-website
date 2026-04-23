<?php
require_once 'config.php';

if (!isset($_GET['id'])) {
    sendResponse(false, 'Product ID is required');
}

$id = intval($_GET['id']);
$conn = getConnection();

$stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(false, 'Product not found');
}

$product = $result->fetch_assoc();
sendResponse(true, 'Product fetched successfully', $product);

$stmt->close();
$conn->close();
?>