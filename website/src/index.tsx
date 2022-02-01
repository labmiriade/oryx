import React from 'react';
import ReactDOM from 'react-dom';
import Analytics from '@aws-amplify/analytics';
import Auth from '@aws-amplify/auth';

import './styles/color-scheme.css';
import './styles/application.css';
import './styles/mobile.css';
import './styles/override.css';
import App from './App';

const identityPoolId = process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID ?? '';
const pinpointAppId = process.env.REACT_APP_PINPOINT_APP_ID ?? '';

if (identityPoolId.trim() !== '') {
  const amplifyConfig = {
    Auth: {
      identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID,
      region: process.env.REACT_APP_AWS_REGION,
    },
  };
  Auth.configure(amplifyConfig);
}

if (pinpointAppId !== '') {
  const analyticsConfig = {
    AWSPinpoint: {
      appId: process.env.REACT_APP_PINPOINT_APP_ID,
      region: process.env.REACT_APP_AWS_REGION,
      mandatorySignIn: false,
    },
  };
  Analytics.configure(analyticsConfig);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
