<?php
// Проверка пароля
session_start();

$correct_password = '2273#!D@#GV%^%H34245@!2fdad34t';

if ($_POST['password'] ?? '' === $correct_password) {
    $_SESSION['admin_logged_in'] = true;
    header('Location: management.html');
    exit;
}

if (!($_SESSION['admin_logged_in'] ?? false)) {
    ?>
    <!DOCTYPE html>
    <html lang="uk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Доступ запрещен</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .login-form { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
            .login-form h1 { color: #e74c3c; margin-bottom: 30px; }
            .form-group { margin-bottom: 20px; }
            .form-group input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 5px; font-size: 1rem; }
            .btn { background: #e74c3c; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; width: 100%; }
            .btn:hover { background: #c0392b; }
        </style>
    </head>
    <body>
        <div class="login-form">
            <h1>🔒 Доступ запрещен</h1>
            <form method="POST">
                <div class="form-group">
                    <input type="password" name="password" placeholder="Введите пароль" required>
                </div>
                <button type="submit" class="btn">Войти</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}
?>
