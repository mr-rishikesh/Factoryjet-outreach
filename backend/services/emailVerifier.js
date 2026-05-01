import dns from 'dns/promises';

const ROLE_ACCOUNTS = ['info', 'support', 'admin', 'hello', 'contact', 'noreply', 'no-reply', 'help', 'sales', 'team', 'office'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const verifyEmail = async (email) => {
  try {
    const result = {
      email,
      valid: false,
      checks: {
        format: false,
        mxRecord: false,
        notRoleAccount: true,
      },
      warnings: [],
      error: null,
    };

    // Check 1: Format validation
    if (!EMAIL_REGEX.test(email)) {
      result.error = 'Invalid email format';
      return result;
    }
    result.checks.format = true;

    const [localPart, domain] = email.split('@');

    // Check 2: Role account detection
    if (ROLE_ACCOUNTS.includes(localPart.toLowerCase())) {
      result.checks.notRoleAccount = false;
      result.warnings.push('Email appears to be a role/shared account');
    }

    // Check 3: MX record check (DNS)
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        result.checks.mxRecord = true;
      } else {
        result.error = 'No MX records found for domain';
        return result;
      }
    } catch (dnsErr) {
      result.error = `DNS lookup failed: ${dnsErr.code} - ${domain}`;
      return result;
    }

    // If format is good AND MX records exist, email is valid
    result.valid = result.checks.format && result.checks.mxRecord;

    return result;
  } catch (err) {
    console.error('[EmailVerifier] Verification error:', err.message);
    return {
      email,
      valid: false,
      checks: { format: false, mxRecord: false, notRoleAccount: true },
      warnings: [],
      error: err.message,
    };
  }
};

export const verifyEmailBatch = async (emails) => {
  try {
    const results = await Promise.all(emails.map((email) => verifyEmail(email)));

    const valid = results.filter((r) => r.valid).map((r) => r.email);
    const invalid = results.filter((r) => !r.valid).map((r) => r.email);

    return {
      total: emails.length,
      valid: valid.length,
      invalid: invalid.length,
      validEmails: valid,
      invalidEmails: invalid,
      report: results,
    };
  } catch (err) {
    console.error('[EmailVerifier] Batch verification error:', err.message);
    throw err;
  }
};
