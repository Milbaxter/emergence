#!/usr/bin/env node

/**
 * Dark Pattern Detector V3 - Real DOM Parsing
 * Integrates JSDOM for actual HTML parsing and analysis
 * Can process real website HTML and detect manipulation patterns
 */

const { JSDOM } = require('jsdom');

class DarkPatternDetector {
  constructor() {
    this.categories = {
      confirmshaming: {
        name: 'Confirmshaming',
        description: 'Shame/guilt-based decline options',
        severity: 'high',
        patterns: []
      },
      temporal: {
        name: 'Temporal Pressure',
        description: 'Artificial urgency and scarcity',
        severity: 'high',
        patterns: []
      },
      privacy: {
        name: 'Privacy Zuckering',
        description: 'Tricking into sharing more than intended',
        severity: 'critical',
        patterns: []
      },
      forcedContinuity: {
        name: 'Forced Continuity',
        description: 'Hard to cancel subscriptions',
        severity: 'critical',
        patterns: []
      },
      choiceOverload: {
        name: 'Choice Overload',
        description: 'Overwhelming options to paralyze decision-making',
        severity: 'medium',
        patterns: []
      },
      socialProof: {
        name: 'Social Proof Manipulation',
        description: 'Fabricated social validation',
        severity: 'high',
        patterns: []
      },
      misdirection: {
        name: 'Misdirection',
        description: 'Visual/interaction tricks to mislead',
        severity: 'high',
        patterns: []
      },
      obstruction: {
        name: 'Obstruction',
        description: 'Making beneficial actions difficult',
        severity: 'high',
        patterns: []
      }
    };
  }

  /**
   * Analyze HTML string for dark patterns
   * @param {string} html - HTML content to analyze
   * @param {string} url - Optional URL for context
   * @returns {Object} Detection results
   */
  analyzeHTML(html, url = 'unknown') {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const results = {
      url,
      timestamp: new Date().toISOString(),
      patterns: [],
      score: 0,
      categoryCounts: {}
    };

    // Run all detection methods
    this.detectConfirmshaming(document, results);
    this.detectTemporalPressure(document, results);
    this.detectPrivacyZuckering(document, results);
    this.detectForcedContinuity(document, results);
    this.detectChoiceOverload(document, results);
    this.detectSocialProofManipulation(document, results);
    this.detectMisdirection(document, results);
    this.detectObstruction(document, results);

    // Calculate final score
    this.calculateScore(results);

    return results;
  }

  /**
   * Analyze a live URL (requires fetch capability)
   * @param {string} url - URL to analyze
   * @returns {Promise<Object>} Detection results
   */
  async analyzeURL(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return this.analyzeHTML(html, url);
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
  }

  detectConfirmshaming(document, results) {
    const shameKeywords = [
      /no.*thanks.*i.*don't.*want/i,
      /no.*i.*prefer.*to.*pay.*full.*price/i,
      /i.*don't.*want.*to.*save/i,
      /i.*hate.*discounts/i,
      /continue.*without.*protection/i,
      /skip.*this.*limited.*offer/i,
      /proceed.*unprotected/i
    ];

    const buttons = document.querySelectorAll('button, a, .button, .btn, [role="button"]');
    
    buttons.forEach(button => {
      const text = button.textContent.trim();
      shameKeywords.forEach(pattern => {
        if (pattern.test(text)) {
          this.addPattern(results, 'confirmshaming', {
            element: button.tagName,
            text,
            context: this.getContext(button),
            confidence: 0.9
          });
        }
      });
    });
  }

  detectTemporalPressure(document, results) {
    const urgencyKeywords = [
      /only.*\d+.*left/i,
      /\d+.*people.*viewing/i,
      /expires.*in/i,
      /limited.*time/i,
      /flash.*sale/i,
      /ending.*soon/i,
      /last.*chance/i,
      /selling.*fast/i,
      /almost.*gone/i
    ];

    // Check all text nodes
    const walker = document.createTreeWalker(
      document.body,
      4, // NodeFilter.SHOW_TEXT
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (!text) continue;

      urgencyKeywords.forEach(pattern => {
        if (pattern.test(text)) {
          this.addPattern(results, 'temporal', {
            text,
            context: this.getContext(node.parentElement),
            confidence: 0.8
          });
        }
      });
    }

    // Check for countdown timers
    const timers = document.querySelectorAll('[class*="countdown"], [id*="countdown"], [class*="timer"]');
    timers.forEach(timer => {
      this.addPattern(results, 'temporal', {
        element: timer.tagName,
        className: timer.className,
        context: 'Countdown timer detected',
        confidence: 0.95
      });
    });
  }

  detectPrivacyZuckering(document, results) {
    // Check for pre-checked privacy-invasive options
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      if (!checkbox.checked) return;

      const labelText = this.getLabelText(checkbox);
      const privacyKeywords = [
        /share.*data/i,
        /marketing.*emails/i,
        /third.*party/i,
        /sell.*information/i,
        /promotional.*messages/i,
        /newsletter/i,
        /partner.*offers/i
      ];

      privacyKeywords.forEach(pattern => {
        if (pattern.test(labelText)) {
          this.addPattern(results, 'privacy', {
            element: 'checkbox',
            label: labelText,
            prechecked: true,
            confidence: 0.9
          });
        }
      });
    });

    // Check for misleading privacy consent
    const privacyText = document.body.textContent;
    if (/by.*continuing.*you.*agree/i.test(privacyText) && 
        !document.querySelector('[type="checkbox"]')) {
      this.addPattern(results, 'privacy', {
        context: 'Implied consent without explicit checkbox',
        confidence: 0.7
      });
    }
  }

  detectForcedContinuity(document, results) {
    const bodyText = document.body.textContent.toLowerCase();
    
    // Free trial with credit card required
    if ((bodyText.includes('free trial') || bodyText.includes('trial')) &&
        (bodyText.includes('credit card') || bodyText.includes('payment method'))) {
      this.addPattern(results, 'forcedContinuity', {
        context: 'Free trial requires payment method',
        confidence: 0.85
      });
    }

    // Auto-renewal language
    if (bodyText.includes('auto-renew') || bodyText.includes('automatically renew')) {
      this.addPattern(results, 'forcedContinuity', {
        context: 'Auto-renewal subscription',
        confidence: 0.75
      });
    }

    // Check for hidden cancellation information
    const cancelLinks = document.querySelectorAll('a[href*="cancel"], button:contains("cancel")');
    if (cancelLinks.length === 0 && /subscription|membership/i.test(bodyText)) {
      this.addPattern(results, 'forcedContinuity', {
        context: 'No visible cancellation option on subscription page',
        confidence: 0.6
      });
    }
  }

  detectChoiceOverload(document, results) {
    // Count options in dropdowns
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      const optionCount = select.querySelectorAll('option').length;
      if (optionCount > 50) {
        this.addPattern(results, 'choiceOverload', {
          element: 'select',
          optionCount,
          context: this.getContext(select),
          confidence: 0.8
        });
      }
    });

    // Count product variants/options
    const productOptions = document.querySelectorAll('[class*="variant"], [class*="option"]');
    if (productOptions.length > 20) {
      this.addPattern(results, 'choiceOverload', {
        variantCount: productOptions.length,
        context: 'Excessive product options',
        confidence: 0.7
      });
    }
  }

  detectSocialProofManipulation(document, results) {
    const reviewSelectors = [
      '[class*="review"]',
      '[class*="rating"]',
      '[class*="testimonial"]',
      '[itemprop="review"]'
    ];

    let reviewCount = 0;
    const reviewTexts = [];

    reviewSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        reviewCount++;
        reviewTexts.push(el.textContent.slice(0, 100));
      });
    });

    // Check for fake reviews (duplicate content)
    const uniqueReviews = new Set(reviewTexts);
    if (reviewTexts.length > 5 && uniqueReviews.size / reviewTexts.length < 0.5) {
      this.addPattern(results, 'socialProof', {
        context: `Suspected fake reviews: ${reviewTexts.length} reviews, only ${uniqueReviews.size} unique`,
        confidence: 0.85,
        duplicateRatio: (uniqueReviews.size / reviewTexts.length).toFixed(2)
      });
    }

    // Check for generic testimonials
    const genericPhrases = [
      /amazing product/i,
      /highly recommend/i,
      /best.*ever/i,
      /changed.*my.*life/i
    ];

    let genericCount = 0;
    reviewTexts.forEach(text => {
      if (genericPhrases.some(pattern => pattern.test(text))) {
        genericCount++;
      }
    });

    if (genericCount > 3 && genericCount / reviewTexts.length > 0.5) {
      this.addPattern(results, 'socialProof', {
        context: `Generic testimonials: ${genericCount}/${reviewTexts.length}`,
        confidence: 0.7
      });
    }
  }

  detectMisdirection(document, results) {
    // Check for misdirection in buttons (visual hierarchy tricks)
    const buttons = document.querySelectorAll('button, .button, .btn');
    
    buttons.forEach(button => {
      const style = button.getAttribute('style') || '';
      const className = button.className || '';
      const text = button.textContent.trim().toLowerCase();

      // Negative action styled prominently
      if ((text.includes('yes') || text.includes('accept') || text.includes('agree')) &&
          (style.includes('color: #ccc') || className.includes('secondary') || className.includes('ghost'))) {
        this.addPattern(results, 'misdirection', {
          element: 'button',
          text: button.textContent.trim(),
          context: 'Positive action styled as secondary',
          confidence: 0.75
        });
      }
    });

    // Check for hidden costs
    const priceElements = document.querySelectorAll('[class*="price"]');
    priceElements.forEach(el => {
      const text = el.textContent;
      const matches = text.match(/\$(\d+\.?\d*)/g);
      if (matches && matches.length > 1) {
        const prices = matches.map(p => parseFloat(p.replace('$', '')));
        const displayPrice = Math.min(...prices);
        const actualPrice = Math.max(...prices);
        
        if (actualPrice / displayPrice > 1.5) {
          this.addPattern(results, 'misdirection', {
            displayPrice: `$${displayPrice}`,
            actualPrice: `$${actualPrice}`,
            increase: `${((actualPrice / displayPrice - 1) * 100).toFixed(0)}%`,
            confidence: 0.9
          });
        }
      }
    });
  }

  detectObstruction(document, results) {
    // Check for tiny text (often used for important info)
    const smallText = document.querySelectorAll('[style*="font-size"][style*="px"]');
    smallText.forEach(el => {
      const style = el.getAttribute('style');
      const match = style.match(/font-size:\s*(\d+)px/);
      if (match && parseInt(match[1]) < 10) {
        const text = el.textContent.slice(0, 50);
        if (/cancel|fee|charge|terms|condition/i.test(text)) {
          this.addPattern(results, 'obstruction', {
            fontSize: `${match[1]}px`,
            text,
            context: 'Important information in tiny text',
            confidence: 0.85
          });
        }
      }
    });

    // Check for excessive form fields
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      if (requiredFields.length > 10) {
        this.addPattern(results, 'obstruction', {
          requiredFields: requiredFields.length,
          context: 'Excessive required form fields',
          confidence: 0.7
        });
      }
    });
  }

  // Helper methods
  getContext(element) {
    if (!element) return 'unknown';
    const parent = element.closest('[class*="modal"], [class*="popup"], section, article') || element;
    return parent.className || parent.tagName;
  }

  getLabelText(checkbox) {
    const id = checkbox.id;
    if (id) {
      const label = checkbox.ownerDocument.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent.trim();
    }
    
    const parentLabel = checkbox.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();
    
    return checkbox.nextSibling?.textContent?.trim() || '';
  }

  addPattern(results, category, details) {
    const categoryInfo = this.categories[category];
    results.patterns.push({
      category: categoryInfo.name,
      severity: categoryInfo.severity,
      ...details
    });

    results.categoryCounts[category] = (results.categoryCounts[category] || 0) + 1;
  }

  calculateScore(results) {
    const severityScores = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1
    };

    results.score = results.patterns.reduce((sum, pattern) => {
      const baseScore = severityScores[pattern.severity] || 1;
      const confidenceMultiplier = pattern.confidence || 1;
      return sum + (baseScore * confidenceMultiplier);
    }, 0);

    results.rating = this.getRating(results.score);
  }

  getRating(score) {
    if (score >= 30) return 'CRITICAL';
    if (score >= 20) return 'HIGH';
    if (score >= 10) return 'MEDIUM';
    if (score > 0) return 'LOW';
    return 'CLEAN';
  }

  generateReport(results) {
    console.log('\n=== DARK PATTERN DETECTION REPORT ===');
    console.log(`URL: ${results.url}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Overall Score: ${results.score.toFixed(1)} (${results.rating})`);
    console.log(`\nPatterns Detected: ${results.patterns.length}`);
    
    if (results.patterns.length === 0) {
      console.log('\n✓ No dark patterns detected');
      return;
    }

    console.log('\nCategory Breakdown:');
    Object.entries(results.categoryCounts).forEach(([category, count]) => {
      const categoryInfo = this.categories[category];
      console.log(`  ${categoryInfo.name}: ${count}`);
    });

    console.log('\nDetailed Findings:');
    results.patterns.forEach((pattern, index) => {
      console.log(`\n${index + 1}. ${pattern.category} (${pattern.severity.toUpperCase()})`);
      console.log(`   Confidence: ${((pattern.confidence || 1) * 100).toFixed(0)}%`);
      
      Object.entries(pattern).forEach(([key, value]) => {
        if (!['category', 'severity', 'confidence'].includes(key)) {
          console.log(`   ${key}: ${value}`);
        }
      });
    });
  }
}

// CLI interface
if (require.main === module) {
  const detector = new DarkPatternDetector();
  
  // Example usage
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head><title>Test Page</title></head>
    <body>
      <h1>Special Offer!</h1>
      <p>Only 3 items left! Sale ends in 2 hours!</p>
      <p>1,247 people viewing this right now</p>
      
      <div class="price">
        <span style="font-size: 24px">$9.99</span>
        <span style="font-size: 10px">Plus $14.99 shipping, $2.99 handling, $19.99 insurance</span>
      </div>
      
      <button class="btn-primary">Yes! I want to save money!</button>
      <button class="btn-ghost">No thanks, I prefer to pay full price</button>
      
      <form>
        <input type="checkbox" id="marketing" checked>
        <label for="marketing">I agree to receive marketing emails and share my data with partners</label>
      </form>
      
      <p>Start your free trial! <span style="font-size: 8px">Credit card required. Auto-renews at $99/month. Cancel by calling customer service Monday-Friday 9am-5pm EST.</span></p>
    </body>
    </html>
  `;
  
  const results = detector.analyzeHTML(testHTML, 'test-page.html');
  detector.generateReport(results);
}

module.exports = { DarkPatternDetector };
