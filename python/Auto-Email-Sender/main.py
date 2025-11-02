import webbrowser
import urllib.parse
import time

def create_gmail_url(to_email, subject, body):
    """Create a Gmail URL with pre-filled email content"""
    params = {
        'to': to_email,
        'su': subject,
        'body': body
    }
    
    # URL encode the parameters
    query_string = '&'.join([f"{key}={urllib.parse.quote(value)}" for key, value in params.items()])
    
    return f"https://mail.google.com/mail/?view=cm&{query_string}"

def main():
    print("=== Email Composer ===")
    print()
    
    # Get user's email (for display purposes)
    user_email = input("Enter your email: ")
    print(f"Hello {user_email}!")
    print()
    
    # Get recipient email
    to_email = input("To whom you want to send email: ")
    
    # Get email subject
    subject = input("Enter email subject: ")
    
    # Get email body
    print("\nWhat you want to say? (Press Enter twice to finish):")
    body_lines = []
    while True:
        line = input()
        if line == "":
            # Check if user pressed Enter twice
            if len(body_lines) > 0 and body_lines[-1] == "":
                body_lines.pop()  # Remove the last empty line
                break
        body_lines.append(line)
    
    body = "\n".join(body_lines)
    
    # Display confirmation
    print("\n" + "="*50)
    print("Email Summary:")
    print(f"From: {user_email}")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body:\n{body}")
    print("="*50)
    
    # Ask for confirmation
    confirm = input("\nPress Enter to open Gmail and send this email, or 'q' to quit: ")
    
    if confirm.lower() != 'q':
        print("\nOpening Chrome and Gmail...")
        
        # Create the Gmail URL
        gmail_url = create_gmail_url(to_email, subject, body)
        
        # Open in Chrome
        try:
            # Try to open in Chrome specifically
            chrome_path = 'C:/Program Files/Google/Chrome/Application/chrome.exe %s'
            webbrowser.get(chrome_path).open(gmail_url)
        except:
            # Fallback to default browser
            webbrowser.open(gmail_url)
        
        print("Gmail should now be open with your email composed!")
        print("Please review and click 'Send' to send the email.")
        
    else:
        print("Email cancelled.")

if __name__ == "__main__":
    main()