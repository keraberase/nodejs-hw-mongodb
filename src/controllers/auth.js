import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';
import { THIRTY_DAYS } from '../constants/index.js';

import { generateAuthUrl } from '../utils/googleOAuth2.js';
import { loginOrSignupWithGoogle } from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const registerUserController = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || 'Failed to register user.',
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const session = await loginUser(req.body);
    setupSession(res, session);
    res.json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(error.status || 401).json({
      status: error.status || 401,
      message: error.message || 'Invalid email or password.',
    });
  }
};

export const refreshUserSessionController = async (req, res) => {
  try {
    const session = await refreshUsersSession({
      sessionId: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });
    setupSession(res, session);
    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Session refresh failed:', error.message);
    res.status(error.status || 401).json({
      status: error.status || 401,
      message: error.message || 'Invalid session or refresh token.',
    });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }
    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    console.error('Logout failed:', error.message);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || 'Failed to log out.',
    });
  }
};

export const requestResetEmailController = async (req, res) => {
  try {
    await requestResetToken(req.body.email);
    res.json({
      message: 'Reset password email has been successfully sent.',
      status: 200,
      data: {},
    });
  } catch (error) {
    console.error('Failed to send reset email:', error.message);
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || 'Failed to send reset password email.',
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    console.log('Received request to /auth/reset-pwd:', req.body); // Логирование данных запроса
    await resetPassword(req.body);
    res.json({
      message: 'Password has been successfully reset.',
      status: 200,
      data: {},
    });
  } catch (error) {
    console.error('Password reset failed:', error.message); // Логирование ошибок
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || 'Failed to reset password.',
    });
  }
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
