Gmail Email Composer (Python Console App)

This is a simple Python console application that helps you compose an email and automatically open Gmail in your browser with the To, Subject, and Body already filled in.

Instead of manually writing an email every time, this script generates a Gmail compose link based on your input — and opens it directly in Google Chrome (or your default browser if Chrome is not found).

Features

Asks for sender email (for display only)

Asks for receiver email ("To")

Asks for subject

Multi-line body input (press Enter twice to finish)

Displays a summary before opening Gmail

Opens Gmail automatically in your browser with everything pre-filled

Requirements

No external installations are required.

This script uses only Python’s built-in modules:



Note: Make sure Google Chrome exists at this path:
C:/Program Files/Google/Chrome/Application/chrome.exe

If Chrome isn’t found, the script will automatically fall back to your default browser.

How to Run

Save the code inside main.py

Open terminal / CMD

Run:

python main.py


Follow the instructions in the console

After confirmation, your Gmail will open with the email already composed.
Just review and click Send.

Example Output
=== Email Composer ===

Enter your email: myemail@gmail.com

To whom you want to send email: test@example.com
Enter email subject: Meeting update

What you want to say? (Press Enter twice to finish):
Hello
We will meet tomorrow.

<press Enter twice>

Email Summary:
From: myemail@gmail.com
To: test@example.com
Subject: Meeting update
Body:
Hello
We will meet tomorrow.

Press Enter to open Gmail and send this email...

Notes

This script does not send the email automatically — it only pre-fills the Gmail compose draft.
You must click Send manually (this is a Gmail security rule).