#!/usr/bin/env node
/**
 * Dark Pattern Detector - Prototype
 * 
 * Purpose: Programmatic detection of manipulation patterns on web pages
 * Not production-ready. Proof of concept for pattern recognition.
 * 
 * Categories implemented:
 * 1. Confirmshaming (button text analysis)
 * 2. Temporal manipulation (countdown timers, fake scarcity)
 * 3. Privacy dark patterns (asymmetric consent UI)
 */

class DarkPatternDetector {
  constructor() {
    this.findings = [];
    this.score = 0;
  }

  // Category 1: Confirmshaming
  detectConfirmshaming(buttonText) {
    const shamingPatterns = [
      /no thanks.*don't want/i,
      /i'll pay full price/i,
      /no.*don't care/i,
      /skip.*miss out/i,
      /continue without/i,
    ];

    for (const pattern of shamingPatterns) {
      if (pattern.test(buttonText)) {
        this.findings.push({
          category: 'Confirmshaming',
          severity: 'medium',
          element: buttonText,
          explanation: 'Button text frames rejection negatively to create shame/guilt',
        });
        this.score += 5;
        return true;
      }
    }
    return false;
  }

  // Category 2: Temporal Manipulation
  detectFakeScarcity(text) {
    const scarcityPatterns = [
      /only \d+ (left|remaining)/i,
      /\d+ people (viewing|watching) (this|now)/i,
      /limited time/i,
      /expires? in \d+:\d+/i,
      /hurry.*\d+ (left|remaining)/i,
    ];

    for (const pattern of scarcityPatterns) {
      if (pattern.test(text)) {
        this.findings.push({
          category: 'Temporal Manipulation',
          severity: 'high',
          element: text,
          explanation: 'Creates artificial urgency through scarcity/time pressure',
          recommendation: 'Verify if scarcity is real. Refresh page - does number change?',
        });
        this.score += 8;
        return true;
      }
    }
    return false;
  }

  // Category 3: Privacy Dark Patterns
  detectAsymmetricConsent(acceptButton, rejectButton) {
    const asymmetries = [];

    // Check visual prominence
    if (acceptButton.color === 'primary' && rejectButton.color === 'gray') {
      asymmetries.push('Accept button visually prominent, reject is de-emphasized');
    }

    // Check label clarity
    if (acceptButton.label.length < rejectButton.label.length * 0.5) {
      asymmetries.push('Accept label simple, reject label verbose/confusing');
    }

    // Check placement
    if (acceptButton.size > rejectButton.size * 1.5) {
      asymmetries.push('Accept button significantly larger');
    }

    if (asymmetries.length > 0) {
      this.findings.push({
        category: 'Privacy Dark Pattern',
        severity: 'high',
        asymmetries: asymmetries,
        explanation: 'Consent UI designed to favor data-sharing over privacy',
      });
      this.score += 7;
      return true;
    }
    return false;
  }

  // Category 4: Forced Continuity
  detectRoachMotel(signupSteps, cancelSteps) {
    const ratio = cancelSteps / signupSteps;

    if (ratio > 3) {
      this.findings.push({
        category: 'Forced Continuity',
        severity: 'high',
        signupSteps: signupSteps,
        cancelSteps: cancelSteps,
        ratio: ratio.toFixed(1),
        explanation: `Canceling is ${ratio.toFixed(1)}x harder than signing up`,
      });
      this.score += 10;
      return true;
    }
    return false;
  }

  // Scoring system
  getSeverityLevel() {
    if (this.score >= 20) return 'CRITICAL - Multiple severe dark patterns detected';
    if (this.score >= 10) return 'HIGH - Significant manipulation present';
    if (this.score >= 5) return 'MEDIUM - Some concerning patterns';
    return 'LOW - Minor or no dark patterns detected';
  }

  // Generate report
  report() {
    return {
      totalFindings: this.findings.length,
      score: this.score,
      severity: this.getSeverityLevel(),
      patterns: this.findings,
    };
  }
}

// Example usage / testing
function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Dark Pattern Detector - Prototype Tests');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: Confirmshaming
  const test1 = new DarkPatternDetector();
  test1.detectConfirmshaming("No thanks, I don't want to save money");
  console.log('Test 1: Confirmshaming');
  console.log(JSON.stringify(test1.report(), null, 2));
  console.log('');

  // Test 2: Fake Scarcity
  const test2 = new DarkPatternDetector();
  test2.detectFakeScarcity('Only 2 left in stock! 47 people viewing this now');
  console.log('Test 2: Fake Scarcity');
  console.log(JSON.stringify(test2.report(), null, 2));
  console.log('');

  // Test 3: Asymmetric Consent
  const test3 = new DarkPatternDetector();
  test3.detectAsymmetricConsent(
    { label: 'Accept', color: 'primary', size: 100 },
    { label: 'Manage preferences', color: 'gray', size: 60 }
  );
  console.log('Test 3: Asymmetric Consent');
  console.log(JSON.stringify(test3.report(), null, 2));
  console.log('');

  // Test 4: Roach Motel
  const test4 = new DarkPatternDetector();
  test4.detectRoachMotel(2, 12); // 2 steps to sign up, 12 to cancel
  console.log('Test 4: Roach Motel');
  console.log(JSON.stringify(test4.report(), null, 2));
  console.log('');

  // Test 5: Multiple patterns (realistic scenario)
  const test5 = new DarkPatternDetector();
  test5.detectFakeScarcity('Limited time offer! Only 3 left!');
  test5.detectConfirmshaming("No thanks, I'll pay full price");
  test5.detectAsymmetricConsent(
    { label: 'Accept all cookies', color: 'primary', size: 120 },
    { label: 'Customize settings and manage individual preferences', color: 'gray', size: 70 }
  );
  console.log('Test 5: Multiple Patterns (Realistic Page)');
  console.log(JSON.stringify(test5.report(), null, 2));
  console.log('');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { DarkPatternDetector };
