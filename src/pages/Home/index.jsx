import { Fragment, useEffect, useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { AirService, BUILD_ENV } from "@mocanetwork/airkit";
import { generateToken } from '../../services/tokenService';
 
const Home = () => {
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [widget, setWidget] = useState(null);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [apiToken, setApiToken] = useState(null);

  // Configuration from environment variables
  // Note: API URL is determined by BUILD_ENV.SANDBOX in airService.init()
  const config = {
    programId: import.meta.env.VITE_PROGRAM_ID,
    partnerId: import.meta.env.VITE_PARTNER_ID,
    redirectUrl: import.meta.env.VITE_REDIRECT_URL
  };
 
 
  
 
 
  useEffect(() => {
    if (!initializationAttempted) {
      setInitializationAttempted(true);
      initializeWidget();
    }
  }, [initializationAttempted]);
 
  useEffect(() => {
    console.log('Widget state changed to:', widget);
  }, [widget]);
 
  const initializeWidget = async () => {
    try {
      // Step 1: Fetch fresh JWT token from backend
      setVerificationStatus('Fetching authentication token...');
      console.log('Step 1: Fetching JWT token from backend...');

      const tokenData = await generateToken();
      setApiToken(tokenData.token);
      console.log('✓ Token received and stored');

      // Step 2: Initialize AirService
      setVerificationStatus('Initializing AIR SDK...');
      console.log('Step 2: Starting AirService initialization with config:', { partnerId: config.partnerId });
 
      const airService = new AirService({
        partnerId: config.partnerId
      });
      console.log('AirService instance created:', airService);
 
      console.log('Calling airService.init with BUILD_ENV.SANDBOX...');
      const initResult = await airService.init({
        buildEnv: BUILD_ENV.SANDBOX,
        enableLogging: true,
        skipRehydration: true
      });
 
      console.log('Init result:', initResult);
      console.log('AirService after init:', airService);
      console.log('Setting widget state...');
 
      setWidget(airService);
      setVerificationStatus('Ready for verification');
 
      console.log('✓ Initialization complete');
    } catch (error) {
      console.error('Failed to initialize:', error);
      console.error('Error details:', error.message, error.stack);
      setVerificationStatus(`Initialization failed: ${error.message}`);
      setWidget(null);
      setApiToken(null);
    }
  };
 
  const handleVerification = async () => {
    console.log('Starting verification process...', widget, config);
 
    if (!widget) {
      console.error('Widget not initialized');
      setVerificationStatus('Widget not ready');
      return;
    }
 
    try {
      setIsLoading(true);
      setVerificationStatus('Connecting to verification service...');
 
      // First ensure user is logged in
      console.log('Checking if user login is required...');
 
      // This will trigger the login flow if user is not authenticated
      const loginResult = await widget.login();
      console.log('Login result:', loginResult);
 
      console.log('Calling widget.verifyCredential with params:', {
        authToken: apiToken ? 'PRESENT' : 'MISSING',
        programId: config.programId,
        redirectUrl: config.redirectUrl
      });
 
      const result = await widget.verifyCredential({
        authToken: apiToken,
        programId: config.programId,
        redirectUrl: config.redirectUrl
      });
 
      console.log('Verification result received:', result);
 
      if (result && result.success !== false) {
        setVerificationStatus('Verification completed successfully');
        // Navigate to verification step
      } else {
        setVerificationStatus('Verification completed but no credentials found');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error properties:', Object.keys(error));
 
      let errorMessage = 'Unknown error';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.toString) {
        errorMessage = error.toString();
      }
 
      setVerificationStatus(`Verification failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <Fragment>
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 px-4">
        <div className="max_w_480 w-100">
          {/* Logo Section */}
          <div className="mb-1 text-center">
            <img
              src="/DAT-logo.png"
              alt="DAT Logo"
              style={{
                width: '120px',
                height: '120px',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>

          {/* Heading */}
          <h1 className="text-dark fw-400 fs-22 mb-4 text-center" style={{ lineHeight: '1.5' }}>
            To be eligible you need to verify your spendings on Oyunfur for game cards
          </h1>

          {/* Button */}
          <CustomButton
            onClick={handleVerification}
            disabled={isLoading}
            title={isLoading ? "Initializing..." : "Understood and continue"}
            layout="dark"
            className="mb-3"
          />

          {/* Status Messages (hidden during normal flow) */}
          {verificationStatus && (
            <div className="alert alert-info mt-3">
              {verificationStatus}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}

export default Home;