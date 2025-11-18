import speedtest ;


def simple_speed_test():
    print("Testing your internet speed... Please wait...")
    
    st = speedtest.Speedtest()
    
    # Get best server
    st.get_best_server()
    
    # Test speeds
    download = st.download() / 1_000_000  # Mbps
    upload = st.upload() / 1_000_000    # Mbps
    ping = st.results.ping
    
    print("\n" + "="*40)
    print("INTERNET SPEED TEST RESULTS")
    print("="*40)
    print(f"Download Speed: {download:.2f} Mbps")
    print(f"Upload Speed: {upload:.2f} Mbps")
    print(f"Ping: {ping:.2f} ms")
    print("="*40)

if __name__ == "__main__":
    simple_speed_test()