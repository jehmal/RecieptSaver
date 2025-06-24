# Fix iPhone "No usable data found" QR Code Issue

## Problem
When scanning the Expo QR code with iPhone, you get "No usable data found" error.

## Root Cause
This happens because:
1. **WSL2 Network Isolation**: Your development server runs on WSL2's internal network (172.17.x.x) which is not accessible from external devices
2. **LAN URL Issue**: The QR code contains a local network URL that your iPhone can't reach
3. **Windows Firewall**: May block incoming connections to the Metro bundler

## Solutions

### Solution 1: Use Tunnel Mode (Recommended)
Run Expo with tunnel mode to create a publicly accessible URL:

```bash
# Stop current Expo server (if running)
# Press Ctrl+C in the terminal where Expo is running

# Run the tunnel script
./START_EXPO_TUNNEL.sh
```

This creates a URL like `exp://xxx.xxx.exp.direct:80` that works from anywhere.

### Solution 2: Use Windows IP Address
If tunnel mode is slow, you can use your Windows machine's IP:

1. Find your Windows IP address:
   ```powershell
   # Run in Windows PowerShell
   ipconfig
   ```
   Look for your WiFi adapter's IPv4 Address (e.g., 192.168.1.100)

2. Start Expo with that IP:
   ```bash
   EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 REACT_NATIVE_PACKAGER_HOSTNAME=<your-windows-ip> npx expo start
   ```

3. Configure Windows Firewall:
   - Open Windows Defender Firewall
   - Click "Allow an app or feature"
   - Allow Node.js through both private and public networks

### Solution 3: Use Expo Go App Properly
Ensure you're using the Expo Go app correctly:

1. **Download Expo Go** from App Store (not just camera app)
2. **Open Expo Go first**, then scan QR code from within the app
3. **Same WiFi Network**: Ensure iPhone and computer are on same network (for LAN mode)

### Quick Diagnostic Commands

Check if Expo is running:
```bash
ps aux | grep expo
```

Check Metro bundler status:
```bash
curl http://localhost:8081/status
```

Check what IP addresses are available:
```bash
ip addr show | grep inet
```

### Alternative: Manual Connection
If QR code still doesn't work:

1. In Expo Go app, tap "Enter URL manually"
2. For tunnel mode: Enter the URL shown in terminal (exp://xxx.exp.direct)
3. For LAN mode: Enter `exp://<windows-ip>:8081`

### Common Issues

**"Network response timed out"**
- Windows Firewall blocking connection
- Wrong IP address
- Not on same WiFi network

**"Could not connect to development server"**
- Metro bundler not running
- Using WSL IP instead of Windows IP
- Port 8081 blocked

**"No usable data found"**
- Not using Expo Go app
- QR code partially visible
- Camera permissions not granted

## Recommended Approach

1. **First attempt**: Use tunnel mode (`./START_EXPO_TUNNEL.sh`)
   - Works everywhere but slightly slower
   - No firewall configuration needed

2. **For faster development**: Configure LAN mode with Windows IP
   - Faster hot reloading
   - Requires firewall configuration

3. **Verify Setup**: 
   - Scan QR code with Expo Go app (not iPhone camera)
   - Check terminal for connection logs
   - Try manual URL entry if QR fails