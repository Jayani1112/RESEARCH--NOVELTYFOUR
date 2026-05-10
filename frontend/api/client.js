import axios from 'axios';

// Replace with your local machine IP if running on physical device
// For Android emulator: 10.0.2.2
// For iOS simulator: localhost
const apiClient = axios.create({
  baseURL: 'http://192.168.8.116:5000/api', // Updated to computer's local Wi-Fi IP
  timeout: 10000,
});

export default apiClient;
