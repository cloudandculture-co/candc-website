<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

// Instantiate PHPMailer
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'mail.uigator.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'support@uigator.com'; // Your email address
    $mail->Password   = 'Bluetherp111$$'; // Your email account password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;

    // Recipients
    $mail->setFrom($email, $name);
    $mail->addAddress('support@uigator.com'); // Your email address

    // Content
    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body    = $message;

    // Send the email
    $mail->send();

    // Send success response
    echo 'Message sent successfully';
} catch (Exception $e) {
    // Send error response
    echo 'Message could not be sent. Error: ' . $mail->ErrorInfo;
}
