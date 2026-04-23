<?php
require_once 'config.php';

$conn = getConnection();

// Get filter parameters
$series = isset($_GET['series']) ? $_GET['series'] : null;
$min_price = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
$max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
$screen_size = isset($_GET['screen_size']) ? $_GET['screen_size'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;

// Build query
$sql = "SELECT * FROM products WHERE 1=1";
$params = [];
$types = "";

if ($series && $series !== 'all') {
    $sql .= " AND series = ?";
    $params[] = $series;
    $types .= "s";
}

if ($min_price) {
    $sql .= " AND price >= ?";
    $params[] = $min_price;
    $types .= "d";
}

if ($max_price) {
    $sql .= " AND price <= ?";
    $params[] = $max_price;
    $types .= "d";
}

if ($screen_size && $screen_size !== 'all') {
    $sql .= " AND screen_size = ?";
    $params[] = $screen_size;
    $types .= "s";
}

if ($search) {
    $sql .= " AND (name LIKE ? OR description LIKE ?)";
    $search_term = "%$search%";
    $params[] = $search_term;
    $params[] = $search_term;
    $types .= "ss";
}

$sql .= " ORDER BY featured DESC, price DESC";

// Execute query
$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

sendResponse(true, 'Products fetched successfully', $products);

$stmt->close();
$conn->close();
?>