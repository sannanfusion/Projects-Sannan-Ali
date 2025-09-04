import random

def number_guessing_game():
    """A simple number guessing game with score tracking"""
    
    print("🎯 Welcome to the Number Guessing Game!")
    print("I'm thinking of a number between 1 and 100.")
    
    # Game settings
    max_attempts = 7
    score = 0
    
    while True:
        # Generate random number
        secret_number = random.randint(1, 100)
        attempts = 0
        
        print(f"\nYou have {max_attempts} attempts to guess the number.")
        
        # Guessing loop
        while attempts < max_attempts:
            try:
                guess = int(input("\nEnter your guess: "))
                
                # Check if guess is valid
                if guess < 1 or guess > 100:
                    print("Please enter a number between 1 and 100.")
                    continue
                
                attempts += 1
                
                # Check if guess is correct
                if guess == secret_number:
                    print(f"🎉 Congratulations! You guessed it in {attempts} attempts!")
                    score += (max_attempts - attempts + 1) * 10
                    break
                elif guess < secret_number:
                    print("⬆️ Too low! Try a higher number.")
                else:
                    print("⬇️ Too high! Try a lower number.")
                    
                # Show attempts remaining
                print(f"Attempts left: {max_attempts - attempts}")
                
            except ValueError:
                print("❌ Please enter a valid number.")
        
        # If player ran out of attempts
        if attempts == max_attempts and guess != secret_number:
            print(f"😢 Game over! The number was {secret_number}.")
        
        # Display current score
        print(f"🏆 Your current score: {score}")
        
        # Ask if player wants to play again
        play_again = input("\nDo you want to play again? (yes/no): ").lower()
        if play_again not in ['yes', 'y']:
            print(f"\nThanks for playing! Your final score is: {score}")
            break

# Run the game
if __name__ == "__main__":
    number_guessing_game()