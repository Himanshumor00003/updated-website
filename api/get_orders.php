<?php
require_once 'config.php';

$conn = getConnection();

// Get filters
$status = isset($_GET['status']) ? $_GET['status'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;

$sql = "SELECT o.*, 
        GROUP_CONCAT(CONCAT(oi.product_name, ' (x', oi.quantity, ')') SEPARATOR ', ') AS items,
        SUM(oi.quantity) AS total_quantity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE 1=1";
$params = [];
$types = "";

if ($status && $status !== 'all') {
    $sql .= " AND o.order_status = ?";
    $params[] = $status;
    $types .= "s";
}
if ($search) {
    $sql .= " AND (o.customer_name LIKE ? OR o.customer_email LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= "ss";
}

$sql .= " GROUP BY o.id ORDER BY o.created_at DESC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    // If no order_items exist (old orders), fallback to product_name and quantity from orders table
    if (empty($row['items'])) {
        $row['items'] = $row['product_name'] ?? 'Product';
        $row['total_quantity'] = $row['quantity'] ?? 1;
    }
    $orders[] = $row;
}

sendResponse(true, 'Orders fetched successfully', $orders);
$stmt->close();
$conn->close();
?>