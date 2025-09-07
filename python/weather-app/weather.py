import requests
import json
from datetime import datetime

def get_weather(city_name):
    """
    Fetches weather data for a given city using the OpenWeatherMap API
    """
    # API configuration
    API_KEY = "YOUR API KEY HERE" 
    BASE_URL = "http://api.openweathermap.org/data/2.5/weather"
    
    # Request parameters
    params = {
        'q': city_name,
        'appid': API_KEY,
        'units': 'metric'  # Celsius
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data['cod'] != 200:
            print(f"Error: {data['message']}")
            return None
            
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None
    except json.JSONDecodeError:
        print("Error parsing weather data")
        return None


def display_weather(weather_data, city_name):
    """
    Displays weather information in a formatted way
    """
    if not weather_data:
        return
        
    main = weather_data['main']
    weather = weather_data['weather'][0]
    wind = weather_data['wind']
    sys = weather_data['sys']
    
    sunrise = datetime.fromtimestamp(sys['sunrise']).strftime('%H:%M:%S')
    sunset = datetime.fromtimestamp(sys['sunset']).strftime('%H:%M:%S')
    
    print("\n" + "="*50)
    print(f"Weather in {city_name.title()}, {sys['country']}")
    print("="*50)
    print(f"Description: {weather['description'].title()}")
    print(f"Temperature: {main['temp']}°C (Feels like {main['feels_like']}°C)")
    print(f"Humidity: {main['humidity']}%")
    print(f"Pressure: {main['pressure']} hPa")
    print(f"Wind: {wind['speed']} m/s, Direction: {wind.get('deg', 'N/A')}°")
    print(f"Sunrise: {sunrise}")
    print(f"Sunset: {sunset}")
    print("="*50)


def main():
    """
    Main function to run the weather application
    """
    print("🌤️  Weather Information Fetcher 🌤️")
    print("Get current weather conditions for any city")
    print("Type 'quit' to exit the program")
    
    while True:
        city_name = input("\nEnter city name: ").strip()
        
        if city_name.lower() in ['quit', 'exit', 'q']:
            print("Goodbye! 👋")
            break
            
        if not city_name:
            print("Please enter a city name.")
            continue
            
        print(f"Fetching weather data for {city_name}...")
        weather_data = get_weather(city_name)
        
        if weather_data:
            display_weather(weather_data, city_name)
        else:
            print(f"Could not retrieve weather data for {city_name}.")


if __name__ == "__main__":
    main()
