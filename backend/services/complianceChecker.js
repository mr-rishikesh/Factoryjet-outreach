import dns from 'dns/promises';
import Contact from '../models/Contacts.js';

const SENDING_DOMAIN = process.env.SENDING_DOMAIN || 'factoryjet.com';
const DKIM_SELECTOR = process.env.DKIM_SELECTOR || 'fj';

export const checkCompliance = async (sequenceType) => {
  try {
    if (!['A', 'B'].includes(sequenceType)) {
      throw new Error('Invalid sequenceType: must be A or B');
    }

    const checks = {};
    let passedCount = 0;
    const recommendations = [];

    // Check 1: SPF Record
    try {
      const txtRecords = await dns.resolveTxt(SENDING_DOMAIN);
      const hasSPF = txtRecords.some((record) => record.join('').includes('v=spf1'));
      checks.spf = {
        pass: hasSPF,
        detail: hasSPF ? 'SPF record found' : 'SPF record not found',
      };
      if (hasSPF) passedCount++;
      else recommendations.push('Add SPF record to domain: v=spf1 include:sendgrid.net ~all');
    } catch (err) {
      checks.spf = {
        pass: false,
        detail: `SPF check failed: ${err.message}`,
      };
      recommendations.push('Verify SPF record exists for sending domain');
    }

    // Check 2: DKIM Record
    try {
      const dkimDomain = `${DKIM_SELECTOR}._domainkey.${SENDING_DOMAIN}`;
      const txtRecords = await dns.resolveTxt(dkimDomain);
      const hasDKIM = txtRecords && txtRecords.length > 0;
      checks.dkim = {
        pass: hasDKIM,
        detail: hasDKIM ? 'DKIM record found' : 'DKIM record not found',
      };
      if (hasDKIM) passedCount++;
      else recommendations.push(`Add DKIM record at ${dkimDomain}`);
    } catch (err) {
      checks.dkim = {
        pass: false,
        detail: `DKIM check failed: ${err.message}`,
      };
      recommendations.push(`Verify DKIM selector and domain: ${DKIM_SELECTOR}._domainkey.${SENDING_DOMAIN}`);
    }

    // Check 3: Token Completeness
    try {
      const total = await Contact.countDocuments({
        'emailSequence.sequenceType': sequenceType,
      });

      const missingTokens = await Contact.countDocuments({
        'emailSequence.sequenceType': sequenceType,
        $or: [{ firstName: { $in: [null, ''] } }, { companyName: { $in: [null, ''] } }, { industry: { $in: [null, ''] } }],
      });

      const completeCount = total - missingTokens;
      const completenessScore = total > 0 ? Math.round((completeCount / total) * 100) : 100;

      checks.tokenCompleteness = {
        pass: completenessScore >= 95,
        detail: `${completeCount}/${total} contacts have required tokens (${completenessScore}%)`,
        score: completenessScore,
      };

      if (checks.tokenCompleteness.pass) {
        passedCount++;
      } else {
        recommendations.push(`Import missing tokens for ${missingTokens} contacts (firstName, companyName, industry)`);
      }
    } catch (err) {
      checks.tokenCompleteness = {
        pass: false,
        detail: `Token check failed: ${err.message}`,
      };
    }

    // Check 4: Email List Quality (bounce rate & unsub rate)
    try {
      const total = await Contact.countDocuments({
        'emailSequence.sequenceType': sequenceType,
      });

      const bounced = await Contact.countDocuments({
        'emailSequence.sequenceType': sequenceType,
        'flags.bounced': true,
      });

      const unsubscribed = await Contact.countDocuments({
        'emailSequence.sequenceType': sequenceType,
        'flags.unsubscribe': true,
      });

      const bounceRate = total > 0 ? (bounced / total) * 100 : 0;
      const unsubRate = total > 0 ? (unsubscribed / total) * 100 : 0;

      const listQualityPass = bounceRate < 5 && unsubRate < 0.5;

      checks.emailListQuality = {
        pass: listQualityPass,
        detail: `Bounce: ${bounceRate.toFixed(1)}%, Unsub: ${unsubRate.toFixed(2)}%`,
        bounceRate: parseFloat(bounceRate.toFixed(1)),
        unsubRate: parseFloat(unsubRate.toFixed(2)),
      };

      if (listQualityPass) {
        passedCount++;
      } else {
        if (bounceRate >= 5)
          recommendations.push(`Review bounced contacts (${bounceRate.toFixed(1)}% bounce rate - target <5%)`);
        if (unsubRate >= 0.5) recommendations.push(`High unsubscribe rate detected (${unsubRate.toFixed(2)}%)`);
      }
    } catch (err) {
      checks.emailListQuality = {
        pass: false,
        detail: `List quality check failed: ${err.message}`,
      };
    }

    // Check 5: Unsubscribe Link
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const unsubLinkPass = !!baseUrl && baseUrl.length > 0;
    checks.unsubscribeLink = {
      pass: unsubLinkPass,
      detail: unsubLinkPass ? `Unsubscribe link configured: ${baseUrl}/unsubscribe` : 'BASE_URL not configured',
    };
    if (unsubLinkPass) passedCount++;
    else recommendations.push('Configure BASE_URL environment variable for unsubscribe links');

    // Calculate overall score (each check worth 20 points, max 100)
    const score = passedCount * 20;

    return {
      score,
      sequenceType,
      passed: passedCount,
      total: 5,
      checks,
      recommendations,
      compliant: score >= 80,
    };
  } catch (err) {
    console.error('[ComplianceChecker] Error:', err.message);
    throw err;
  }
};
