       // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            if (document.body.classList.contains('light-theme')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'light');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'dark');
            }
        });

        // Load saved theme
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }

        // Notification System
        function showNotification(message, isError = false) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.classList.toggle('error', isError);
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // API Configuration
        const API_BASE_URL = 'https://api.coingecko.com/api/v3';
        const API_ENDPOINTS = {
            GLOBAL: '/global',
            COINS_MARKET: '/coins/markets',
            COIN_CHART: '/coins/{id}/market_chart'
        };

        // Chart Configuration
        let priceChart = null;
        let selectedCoinId = 'bitcoin';
        let chartDays = 1;

        // Format currency
        function formatCurrency(value) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: value < 1 ? 4 : 2,
                maximumFractionDigits: value < 1 ? 4 : 2
            }).format(value);
        }

        // Format market cap
        function formatMarketCap(value) {
            if (value >= 1e12) {
                return '$' + (value / 1e12).toFixed(2) + 'T';
            } else if (value >= 1e9) {
                return '$' + (value / 1e9).toFixed(2) + 'B';
            } else if (value >= 1e6) {
                return '$' + (value / 1e6).toFixed(2) + 'M';
            } else {
                return '$' + value.toFixed(2);
            }
        }

        // Format percentage
        function formatPercentage(value) {
            return value.toFixed(2) + '%';
        }

        // Generate sparkline SVG
        function generateSparkline(data) {
            const width = 100;
            const height = 30;
            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min;
            
            if (range === 0) return '';
            
            // Normalize data to fit in the SVG
            const normalizedData = data.map(value => 
                height - ((value - min) / range) * (height - 5)
            );
            
            // Create path
            let path = `M 0 ${normalizedData[0]}`;
            for (let i = 1; i < normalizedData.length; i++) {
                path += ` L ${(i / (normalizedData.length - 1)) * width} ${normalizedData[i]}`;
            }
            
            const isPositive = data[data.length - 1] >= data[0];
            const color = isPositive ? '#00c853' : '#ff1744';
            
            return `
                <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                    <path d="${path}" stroke="${color}" fill="none" stroke-width="1.5" />
                </svg>
            `;
        }

        // Fetch data from API with error handling
        async function fetchData(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Error fetching data:', error);
                showNotification('Failed to fetch data. Please try again.', true);
                return null;
            }
        }

        // Fetch global market data
        async function fetchGlobalData() {
            const url = `${API_BASE_URL}${API_ENDPOINTS.GLOBAL}`;
            const data = await fetchData(url);
            
            if (data && data.data) {
                const globalData = data.data;
                
                // Update market cap
                document.getElementById('marketCap').textContent = formatMarketCap(globalData.total_market_cap.usd);
                
                // Update 24h volume
                document.getElementById('volume').textContent = formatMarketCap(globalData.total_volume.usd);
                
                // Update active cryptocurrencies
                document.getElementById('activeCryptos').textContent = globalData.active_cryptocurrencies.toLocaleString();
                
                // Update dominance
                const btcDominance = globalData.market_cap_percentage.btc;
                document.getElementById('dominance').textContent = `BTC: ${btcDominance.toFixed(1)}%`;
                
                // Update change percentages (simulated for demo)
                document.querySelectorAll('.stat-change span').forEach(el => {
                    const change = (Math.random() * 5).toFixed(2);
                    el.textContent = `${change}%`;
                });
            }
        }

        // Fetch coin market data
        async function fetchCoinData() {
            const url = `${API_BASE_URL}${API_ENDPOINTS.COINS_MARKET}?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`;
            const data = await fetchData(url);
            
            if (data) {
                populateCryptoTable(data);
                
                // Auto-select first coin if none selected
                if (!selectedCoinId && data.length > 0) {
                    selectedCoinId = data[0].id;
                    updateChartTitle(data[0].name);
                    fetchChartData(selectedCoinId, chartDays);
                }
            }
        }

        // Fetch chart data
        async function fetchChartData(coinId, days) {
            const url = `${API_BASE_URL}${API_ENDPOINTS.COIN_CHART.replace('{id}', coinId)}?vs_currency=usd&days=${days}`;
            const data = await fetchData(url);
            
            if (data && data.prices) {
                renderChart(data.prices, coinId);
            } else {
                // Fallback: Generate sample data if API fails
                generateSampleChartData(coinId, days);
            }
        }

        // Generate sample chart data (fallback)
        function generateSampleChartData(coinId, days) {
            const now = Date.now();
            const dataPoints = days * 24; // One data point per hour
            
            const prices = [];
            let price = 20000 + Math.random() * 10000; // Starting price
            
            for (let i = 0; i < dataPoints; i++) {
                const timestamp = now - (dataPoints - i) * 3600000; // One hour intervals
                // Random walk for price
                price = price * (1 + (Math.random() - 0.5) * 0.02);
                prices.push([timestamp, price]);
            }
            
            renderChart(prices, coinId);
            showNotification('Using sample data - API limit may be reached', true);
        }

        // Render chart
        function renderChart(priceData, coinId) {
            const ctx = document.getElementById('priceChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (priceChart) {
                priceChart.destroy();
            }
            
            const labels = priceData.map((_, index) => {
                if (chartDays === 1) {
                    // For 1 day, show hours
                    const date = new Date(priceData[index][0]);
                    return date.getHours() + ':00';
                } else if (chartDays <= 30) {
                    // For up to 30 days, show dates
                    const date = new Date(priceData[index][0]);
                    return date.getDate() + '/' + (date.getMonth() + 1);
                } else {
                    // For longer periods, show months
                    const date = new Date(priceData[index][0]);
                    return date.getMonth() + 1 + '/' + date.getFullYear().toString().slice(2);
                }
            });
            
            const data = priceData.map(price => price[1]);
            
            // Determine chart color based on price movement
            const firstPrice = data[0];
            const lastPrice = data[data.length - 1];
            const chartColor = lastPrice >= firstPrice ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 23, 68, 0.2)';
            const borderColor = lastPrice >= firstPrice ? '#00c853' : '#ff1744';
            
            priceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${coinId.toUpperCase()} Price`,
                        data: data,
                        borderColor: borderColor,
                        backgroundColor: chartColor,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `Price: ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                maxTicksLimit: 8
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                callback: function(value) {
                                    return formatCurrency(value);
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        }

        // Update chart title
        function updateChartTitle(coinName) {
            document.getElementById('chartTitle').textContent = `${coinName} Price Chart`;
        }

        // Populate crypto table
        function populateCryptoTable(coins) {
            const tableBody = document.getElementById('cryptoTableBody');
            tableBody.innerHTML = '';
            
            coins.forEach((coin, index) => {
                const row = document.createElement('tr');
                const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
                const changeIcon = coin.price_change_percentage_24h >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                
                // Generate sparkline
                const sparkline = coin.sparkline_in_7d ? generateSparkline(coin.sparkline_in_7d.price) : '';
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <div class="crypto-info">
                            <div class="crypto-icon">
                                <img src="${coin.image}" alt="${coin.name}" width="24" height="24">
                            </div>
                            <div>
                                <div class="crypto-name">${coin.name}</div>
                                <div class="crypto-symbol">${coin.symbol.toUpperCase()}</div>
                            </div>
                        </div>
                    </td>
                    <td>${formatCurrency(coin.current_price)}</td>
                    <td>
                        <span class="price-change ${changeClass}">
                            <i class="fas ${changeIcon}"></i>
                            ${formatPercentage(coin.price_change_percentage_24h)}
                        </span>
                    </td>
                    <td>${formatMarketCap(coin.market_cap)}</td>
                    <td>
                        <div class="sparkline">
                            ${sparkline}
                        </div>
                    </td>
                `;
                
                // Add click event to show chart for this coin
                row.addEventListener('click', () => {
                    selectedCoinId = coin.id;
                    updateChartTitle(coin.name);
                    fetchChartData(selectedCoinId, chartDays);
                });
                
                tableBody.appendChild(row);
            });
        }

        // Timeframe buttons
        const timeframeButtons = document.querySelectorAll('.timeframe-btn');
        timeframeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                timeframeButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                // Update chart days
                chartDays = parseInt(button.getAttribute('data-days'));
                // Fetch new chart data
                if (selectedCoinId) {
                    fetchChartData(selectedCoinId, chartDays);
                }
            });
        });

        // Auto-refresh functionality
        let countdown = 30;
        const countdownElement = document.getElementById('countdown');
        const refreshBtn = document.getElementById('refreshBtn');
        let refreshInterval;
        
        function startCountdown() {
            countdown = 30;
            countdownElement.textContent = countdown;
            
            clearInterval(refreshInterval);
            refreshInterval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    refreshData();
                    countdown = 30;
                }
            }, 1000);
        }
        
        refreshBtn.addEventListener('click', () => {
            refreshData();
            startCountdown();
        });

        // Refresh all data
        function refreshData() {
            fetchGlobalData();
            fetchCoinData();
            if (selectedCoinId) {
                fetchChartData(selectedCoinId, chartDays);
            }
            showNotification('Data updated successfully');
        }

        // Initialize the dashboard
        function initDashboard() {
            fetchGlobalData();
            fetchCoinData();
            fetchChartData('bitcoin', 1); // Default to Bitcoin
            startCountdown();
        }

        // Start the dashboard when page loads
        document.addEventListener('DOMContentLoaded', initDashboard);
  