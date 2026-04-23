<?php
require_once 'config.php';

header("Content-Type: application/json");
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = trim($input['email']);
$password = $input['password'];

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

$conn = getConnection();
$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

$user = $result->fetch_assoc();

// Verify password (supports both MD5 old and new password_hash)
$passwordValid = false;
if (password_verify($password, $user['password'])) {
    $passwordValid = true;
} elseif (md5($password) === $user['password']) {
    // For old MD5 passwords, rehash them
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $updateStmt->bind_param("si", $newHash, $user['id']);
    $updateStmt->execute();
    $passwordValid = true;
}

if (!$passwordValid) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Set session variables
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['role'] = $user['role'];

echo json_encode([
    'success' => true,
    'role' => $user['role'],
    'message' => 'Login successful'
]);
$stmt->close();
$conn->close();
?>