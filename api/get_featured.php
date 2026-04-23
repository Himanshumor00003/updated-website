<?php
require_once 'config.php';

$conn = getConnection();

$sql = "SELECT * FROM products WHERE featured = 1 ORDER BY price DESC LIMIT 6";
$result = $conn->query($sql);

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

sendResponse(true, 'Featured products fetched successfully', $products);

$conn->close();
?>