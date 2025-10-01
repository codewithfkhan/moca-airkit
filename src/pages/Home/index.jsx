import { Fragment, useEffect, useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { AirService, BUILD_ENV } from "@mocanetwork/airkit";
 
const Home = () => {
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [widget, setWidget] = useState(null);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
 
  const API_URL = "https://credential.api.sandbox.air3.com";
 
  // Your configuration from Moca Network Dashboard
  const config = {
    verifierDid: "did:key:81fRftze4NLNiL6YK9j6Drnm5Fx93Dk2mSHuPN63cQes9insgSKE3BCveg6Tp4i76CzdmTRpPq1NkXmD9jyjwMVbPr",           // From dashboard
    apiKey: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzODZjYjRkLWMwZGUtNDYyOS1hNDEyLThkY2Y2ZjUwZjgwNSJ9.eyJwYXJ0bmVySWQiOiIwYzE4MTc3YS1hOTYwLTQyNjUtYTg4OC1lZjY5YzNkNjc3MWMiLCJzY29wZSI6Imlzc3VlIHZlcmlmeSIsImV4cCI6MTc1ODUyNjE1M30.Cih4aDnOnm-LyWpV5ztSA_Q5zpp6mY1fqveQ9hDaYeXw1say3_TOpKFGfRPS2wdMS3Y7CbcJpAVMUt4vOIt5fdqIEPCHl6mKiZdo1-Ru3g8_-9O65JcIWO_zgB5XRacuHGZjVa_F2BTnvHtfKSotBzwPNMEFxEUWk--KOy7-7wdF2BVEOL1IjX4BdAktlQGQwLVfPCEBZVE5uiswJkZvVvnVF1JCvGWCtxddTKyfxeYTIKiyGIXz5F9M_ld3A7qOw0VXjiIRKt5IMgwWI5g6632MJpHZthvVPWBTEI5VMJgmScJwUIQwCgJ08ZjvpqnsfaQiYu6z16pJQQZW0ddZevfHq5esuV_8BvYUlvGijAca_gtUe14-QMHHdZUqz8RnKunJs2R4CwXDocvLO6rxChm0TiHK6UTWDukeY5zFEzXJZcDOfv6i0Mfx6SBu9ENhJt2lMVZ-2Qu01m4rMHYjU9gr1JQrWmINGbWgYCnUJF7js1AwwF5-611EudyOhNhzBkkU99rkIh8sSoUAMPcV2d_K-KBW7VPBanUBVqxWrf4lP6-3Z45LT91z9InlCxtPAkBhH8qJnujuK9fBya28HeS17mKiGVMzHECTkT19zgqbbJyBU_ZFZxoGonQ-zW9i1NsvCU2eS3hyw67nchlcUFL8suSltd7YZTzbTCXGrXE",            // Generated from dashboard  
    programId: "c21p5030jh3oa0071399uW",               // Configured on dashboard
    partnerId: "0c18177a-a960-4265-a888-ef69c3d6771c",                // Air partner ID
    redirectUrl: 'https://developers.sandbox.air3.com/example/issue'
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
      console.log('Starting AirService initialization with config:', { partnerId: config.partnerId });
 
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
      setVerificationStatus('AirService initialized successfully');
 
      console.log('Widget state should be set now');
    } catch (error) {
      console.error('Failed to initialize verifier widget:', error);
      console.error('Error details:', error.message, error.stack);
      setVerificationStatus(`Initialization failed: ${error.message}`);
      setWidget(null);
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
        authToken: config.apiKey ? 'PRESENT' : 'MISSING',
        programId: config.programId,
        redirectUrl: config.redirectUrl
      });
 
      const result = await widget.verifyCredential({
        authToken: config.apiKey,
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
      <CustomButton onClick={handleVerification} disabled={isLoading} title={isLoading ? "Initializing..." : "Start Verification"} layout="dark" className="mb-3">
      </CustomButton>
      {verificationStatus && (
        <div className="alert alert-info mb-3">
          {verificationStatus}
        </div>
      )}
    </Fragment>
  )
}

export default Home;