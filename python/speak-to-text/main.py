# =====================================================
# Voice-to-Text Notepad Assistant
# Required Libraries (install these before running):
# pip install SpeechRecognition
# pip install pyautogui
# pip install pyaudio
# =====================================================

import speech_recognition as sr
import pyautogui
import subprocess
import time
import sys

def open_notepad():
    """Opens Notepad application on Windows"""
    try:
        print("Opening Notepad...")
        subprocess.Popen(['notepad.exe'])
        time.sleep(2)  # Wait for Notepad to load
        print("Notepad opened successfully.")
        return True
    except Exception as e:
        print(f"Error Opening Notepad: {e}")
        return False

def type_text(text):
    """Type text into the active Notepad window"""
    try:
        pyautogui.write(text + ' ', interval=0.05)  # Add space and type with slight delay
        return True
    except Exception as e:
        print(f"Error typing text: {e}")
        return False

def listen_for_speech(recognizer, microphone):
    """Listen to microphone and convert speech to text"""
    try:
        print("Listening... Start speaking now!")
        with microphone as source:
            # Adjust for ambient noise and listen
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=5)
        
        print("Processing speech...")
        text = recognizer.recognize_google(audio).lower()
        print(f"You said: {text}")
        return text
    except sr.WaitTimeoutError:
        print("No speech detected. Listening again...")
        return ""
    except sr.UnknownValueError:
        print("Could not understand, please speak again.")
        return ""
    except sr.RequestError as e:
        print(f"Speech Recognition API unavailable: {e}")
        return None
    except Exception as e:
        print(f"Error in speech recognition: {e}")
        return None

def main():
    """Main function to run the Voice-to-Text Notepad Assistant"""
    print("=" * 50)
    print("Voice-to-Text Notepad Assistant")
    print("Say 'Stop program' anytime to exit")
    print("=" * 50)
    
    # Open Notepad
    if not open_notepad():
        print("Failed to open Notepad. Exiting program.")
        return
    
    # Add small delay to ensure Notepad is active
    time.sleep(1)
    
    # Type starting message
    type_text("### Voice Typing Started... ###")
    pyautogui.press('enter')  # Move to next line
    
    # Initialize speech recognition
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()
    
    print("\nVoice recognition initialized. Start speaking!")
    
    # Main loop for continuous speech recognition
    try:
        while True:
            # Listen for speech
            recognized_text = listen_for_speech(recognizer, microphone)
            
            # Check for errors
            if recognized_text is None:
                print("Critical error in speech recognition. Exiting...")
                break
            
            # Check for stop command
            if "stop program" in recognized_text:
                print("Stop command detected. Closing program...")
                type_text("### Voice Typing Stopped. Program Closed. ###")
                print("Program stopped by voice command.")
                break
            
            # Type recognized text (if any)
            if recognized_text and recognized_text != "stop program":
                type_text(recognized_text)
                
    except KeyboardInterrupt:
        print("\nProgram interrupted by user.")
        type_text("### Program interrupted by user. ###")
    except Exception as e:
        print(f"Unexpected error: {e}")
        type_text("### Program terminated unexpectedly. ###")
    
    print("Voice-to-Text Notepad Assistant has stopped.")

if __name__ == "__main__":
    main()