import SibApiV3Sdk from "sib-api-v3-sdk";
import { config } from "../configs/env.config.js";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = config.BREVO_API_KEY;

const sendEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = {
  name: "LifeAuth Support",
  email: config.BREVO_SENDER_EMAIL
};

export const sendUserVerificationEmail = async (email, token) => {
  const verificationLink = `${config.CLIENT_URL}/verify-email?token=${token}`;

  const emailData = {
    sender,
    to: [{ email }],
    subject: "Verify Your LifeAuth Account",
    htmlContent: `
      <h2>Welcome to LifeAuth</h2>
      <p>Please verify your email by clicking below:</p>
      <a href="${verificationLink}" target="_blank">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    `
  };

  await sendEmailApi.sendTransacEmail(emailData);
};

export const sendNomineeSetupEmail = async (email, token) => {
  const setupLink = `${config.CLIENT_URL}/set-password?token=${token}`;

  const emailData = {
    sender,
    to: [{ email }],
    subject: "Set Your LifeAuth Nominee Password",
    htmlContent: `
      <h2>You Have Been Added as a Nominee</h2>
      <p>Please set your password using the link below:</p>
      <a href="${setupLink}" target="_blank">Set Password</a>
      <p>This link will expire in 1 hour.</p>
    `
  };

  await sendEmailApi.sendTransacEmail(emailData);
};