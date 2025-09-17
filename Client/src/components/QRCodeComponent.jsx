import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QRCode from 'react-qr-code';
import QrScanner from 'qr-scanner';
import { 
  QrCode, 
  Camera, 
  Download, 
  Share2, 
  Copy, 
  X, 
  User, 
  Phone, 
  Wallet,
  CheckCircle,
  AlertCircle,
  Smartphone,
  CameraOff,
  RotateCcw,
  Flashlight,
  FlashlightOff
} from 'lucide-react';
import { Button } from './ui/button';

const QRCodeComponent = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  
  // Check localStorage for which tab should be active initially
  const initialTab = localStorage.getItem('qrCodeActiveTab') || 'generate';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [qrData, setQrData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const canvasRef = useRef(null);

  // Generate QR data for user's mobile number and payment info
  useEffect(() => {
    if (user?.phone) {
      const paymentData = {
        type: 'NEXASPAY_PAYMENT',
        phone: user.phone,
        name: user.fullName || 'NEXASPAY User',
        upiId: `${user.phone}@nexaspay`,
        walletId: `NEXAS${user.id}`,
        timestamp: new Date().toISOString()
      };
      setQrData(JSON.stringify(paymentData));
    }
  }, [user]);

  // Auto-start scanner if scan tab is active initially
  useEffect(() => {
    if (activeTab === 'scan' && initialTab === 'scan') {
      // Small delay to ensure component is mounted
      setTimeout(() => {
        initializeScanner();
      }, 500);
    }
    
    // Clear the localStorage flag after using it
    localStorage.removeItem('qrCodeActiveTab');
  }, [activeTab, initialTab]);

  // Initialize camera for scanning
  const initializeScanner = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            handleScanResult(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment'
          }
        );

        await qrScannerRef.current.start();
        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      console.error('Scanner initialization failed:', err);
      setCameraPermission('denied');
      setError('Camera access denied. Please enable camera permissions to scan QR codes.');
    }
  };

  // Stop scanner
  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle scan result
  const handleScanResult = (data) => {
    try {
      // Try to parse as JSON first (for NEXASPAY QR codes)
      const parsedData = JSON.parse(data);
      setScannedData({
        type: 'structured',
        data: parsedData,
        raw: data
      });
    } catch (e) {
      // If not JSON, treat as plain text (could be UPI, URL, phone number, etc.)
      setScannedData({
        type: 'plain',
        data: data,
        raw: data
      });
    }
    
    setSuccess('QR Code scanned successfully!');
    stopScanner();
    
    // Auto-clear success message
    setTimeout(() => setSuccess(''), 3000);
  };

  // Toggle flashlight
  const toggleFlash = async () => {
    if (qrScannerRef.current) {
      try {
        if (flashEnabled) {
          await qrScannerRef.current.turnFlashOff();
        } else {
          await qrScannerRef.current.turnFlashOn();
        }
        setFlashEnabled(!flashEnabled);
      } catch (err) {
        console.error('Flash toggle failed:', err);
      }
    }
  };

  // Copy QR data to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setSuccess('Payment details copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    const svg = document.getElementById('qr-code-svg');
    
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas2d = document.createElement('canvas');
      const ctx = canvas2d.getContext('2d');
      
      canvas2d.width = 400;
      canvas2d.height = 400;
      
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);
        
        const link = document.createElement('a');
        link.download = `nexaspay-qr-${user?.phone || 'payment'}.png`;
        link.href = canvas2d.toDataURL();
        link.click();
        
        setSuccess('QR code downloaded successfully!');
        setTimeout(() => setSuccess(''), 2000);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // Share QR code
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEXASPAY Payment QR Code',
          text: `Pay me via NEXASPAY: ${user?.fullName || 'User'} (${user?.phone})`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
        copyToClipboard(); // Fallback to copy
      }
    } else {
      copyToClipboard(); // Fallback for unsupported browsers
    }
  };

  // Process scanned payment
  const processPayment = () => {
    if (scannedData?.type === 'structured' && scannedData.data.type === 'NEXASPAY_PAYMENT') {
      const paymentData = scannedData.data;
      // Navigate to payment screen with pre-filled data
      console.log('Processing payment to:', paymentData);
      setSuccess(`Ready to pay ${paymentData.name} (${paymentData.phone})`);
      
      // In a real app, you'd navigate to transfer component with pre-filled data
      // Example: navigate('/transfer', { state: { recipientPhone: paymentData.phone, recipientName: paymentData.name } });
    } else {
      // Handle other QR types (UPI, URLs, etc.)
      console.log('Processing general QR:', scannedData.data);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 m-4 rounded-lg p-1">
          <button
            onClick={() => {
              setActiveTab('generate');
              stopScanner();
              setScannedData(null);
              setError('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'generate'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>My QR Code</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scan');
              setScannedData(null);
              setError('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'scan'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 text-sm">{success}</span>
          </div>
        )}

        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {/* Generate QR Tab */}
        {activeTab === 'generate' && (
          <div className="p-6 space-y-6">
            {/* User Info Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{user?.fullName || 'NEXASPAY User'}</p>
                  <p className="text-blue-100 text-sm">{user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Balance: ₹{balance?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded">
                  ID: NEXAS{user?.id}
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode
                  id="qr-code-svg"
                  value={qrData}
                  size={200}
                  level="M"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Scan this QR code to send money to my NEXASPAY wallet
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="flex flex-col items-center space-y-1 py-4"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs">Download</span>
              </Button>
              <Button
                onClick={shareQRCode}
                variant="outline"
                className="flex flex-col items-center space-y-1 py-4"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs">Share</span>
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex flex-col items-center space-y-1 py-4"
              >
                <Copy className="w-5 h-5" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Payment Methods Accepted</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>NEXASPAY Wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Mobile Transfer</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan QR Tab */}
        {activeTab === 'scan' && (
          <div className="p-6 space-y-4">
            {!isScanning && !scannedData && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
                  <p className="text-sm text-gray-600">
                    Point your camera at a QR code to scan payment details
                  </p>
                </div>
                
                {cameraPermission === 'denied' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-800">
                      <CameraOff className="w-5 h-5" />
                      <span className="text-sm">Camera access denied</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Please enable camera permissions in your browser settings
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={initializeScanner}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                )}
              </div>
            )}

            {/* Camera View */}
            {isScanning && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-black rounded-lg object-cover"
                    playsInline
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={toggleFlash}
                    variant="outline"
                    className="flex-1"
                  >
                    {flashEnabled ? <FlashlightOff className="w-4 h-4 mr-2" /> : <Flashlight className="w-4 h-4 mr-2" />}
                    {flashEnabled ? 'Flash Off' : 'Flash On'}
                  </Button>
                  <Button
                    onClick={stopScanner}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
                
                <p className="text-center text-sm text-gray-600">
                  Position the QR code within the frame to scan
                </p>
              </div>
            )}

            {/* Scanned Result */}
            {scannedData && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">QR Code Scanned</span>
                  </div>
                  
                  {scannedData.type === 'structured' && scannedData.data.type === 'NEXASPAY_PAYMENT' ? (
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{scannedData.data.name}</p>
                            <p className="text-sm text-gray-600">{scannedData.data.phone}</p>
                            <p className="text-xs text-gray-500">NEXASPAY Wallet</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={processPayment}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Send Money
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600 break-all">{scannedData.raw}</p>
                      </div>
                      <Button
                        onClick={() => navigator.clipboard.writeText(scannedData.raw)}
                        variant="outline"
                        className="w-full"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Data
                      </Button>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => {
                    setScannedData(null);
                    initializeScanner();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Scan Another
                </Button>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default QRCodeComponent;