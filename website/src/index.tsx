import React from 'react';
import ReactDOM from 'react-dom';
import Analytics from '@aws-amplify/analytics';
import Auth from '@aws-amplify/auth';

import './styles/color-scheme.css';
import './styles/application.css';
import './styles/mobile.css';
import './styles/override.css';
import App from './App';
import * as rum from 'aws-rum-web';

const identityPoolId = process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID ?? '';
const pinpointAppId = process.env.REACT_APP_PINPOINT_APP_ID ?? '';
const awsRegion = process.env.REACT_APP_AWS_REGION ?? 'eu-central-1';
const guestRoleArn = process.env.REACT_APP_COGNITO_GUEST_ROLE_ARN ?? '';
const rumMonitorId = process.env.REACT_APP_RUM_MONITOR_ID ?? '';

if (
  rumMonitorId.trim() !== '' &&
  identityPoolId.trim() !== '' &&
  guestRoleArn.trim() !== ''
) {
  new rum.AwsRum(rumMonitorId, '1.0.0', awsRegion, {
    sessionSampleRate: 1,
    guestRoleArn: guestRoleArn,
    identityPoolId: identityPoolId,
    endpoint: `https://dataplane.rum.${awsRegion}.amazonaws.com`,
    telemetries: ['errors', 'performance', 'http'],
    allowCookies: true,
    enableXRay: true,
  });
}

if (identityPoolId.trim() !== '') {
  const amplifyConfig = {
    Auth: {
      identityPoolId: identityPoolId,
      region: awsRegion,
    },
  };
  Auth.configure(amplifyConfig);
}

if (pinpointAppId !== '') {
  const analyticsConfig = {
    AWSPinpoint: {
      appId: pinpointAppId,
      region: awsRegion,
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
