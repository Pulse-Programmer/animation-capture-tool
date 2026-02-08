/**
 * Trace Writer
 * 
 * Handles writing interaction traces to JSONL files
 */

import * as fs from 'fs';
import * as path from 'path';
import { TraceRecord, CaptureSession, AnimationProfile } from './types';

export class TraceWriter {
  private sessionDir: string;
  private sessionFile: string;
  private tracesFile: string;
  private session: CaptureSession;

  constructor(outputDir: string, sessionId: string, url: string) {
    this.sessionDir = path.join(outputDir, sessionId);
    this.sessionFile = path.join(this.sessionDir, 'session.json');
    this.tracesFile = path.join(this.sessionDir, 'traces.jsonl');

    // Create session directory
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    this.session = {
      id: sessionId,
      url,
      startTime: Date.now(),
      traces: [],
      profiles: [],
    };
  }

  /**
   * Append a trace record
   */
  appendTrace(trace: TraceRecord): void {
    // Add to session
    this.session.traces.push(trace);

    // Append to JSONL file
    const line = JSON.stringify(trace) + '\n';
    fs.appendFileSync(this.tracesFile, line, 'utf-8');
  }

  /**
   * Extract animation profiles from traces
   */
  extractProfiles(): AnimationProfile[] {
    const profiles: AnimationProfile[] = [];

    // Group traces by selector
    const bySelector = new Map<string, TraceRecord[]>();
    
    for (const trace of this.session.traces) {
      if (trace.type === 'interaction' && trace.event) {
        const selector = trace.event.selector;
        if (!bySelector.has(selector)) {
          bySelector.set(selector, []);
        }
        bySelector.get(selector)!.push(trace);
      }
    }

    // Analyze each group for patterns
    for (const [selector, traces] of bySelector) {
      // Look for consistent style changes
      const styleChanges = this.findConsistentStyleChanges(traces);
      
      if (styleChanges.length > 0) {
        for (const change of styleChanges) {
          profiles.push({
            name: `${change.trigger.event}-on-${selector.split(' ').pop() || 'element'}`,
            trigger: change.trigger,
            effect: change.effect,
          });
        }
      }
    }

    this.session.profiles = profiles;
    return profiles;
  }

  /**
   * Find consistent style changes across traces
   */
  private findConsistentStyleChanges(traces: TraceRecord[]): Array<{
    trigger: { event: string; selector: string };
    effect: AnimationProfile['effect'];
  }> {
    const changes: Array<{
      trigger: { event: string; selector: string };
      effect: AnimationProfile['effect'];
    }> = [];

    for (const trace of traces) {
      if (!trace.event || !trace.before || !trace.after) continue;

      const beforeStyle = trace.before.style.computed;
      const afterStyle = trace.after.style.computed;

      // Find what changed
      const properties: Record<string, { from: string; to: string }> = {};
      
      for (const prop in afterStyle) {
        if (beforeStyle[prop] !== afterStyle[prop]) {
          properties[prop] = {
            from: beforeStyle[prop] || '',
            to: afterStyle[prop] || '',
          };
        }
      }

      if (Object.keys(properties).length > 0) {
        // Determine effect type
        let effectType: 'transition' | 'animation' | 'class-toggle' | 'dom-manipulation' = 'transition';
        
        if (trace.after.dom.classes.length !== trace.before.dom.classes.length) {
          effectType = 'class-toggle';
        } else if (properties['animation-name']) {
          effectType = 'animation';
        }

        // Extract timing if transition exists
        const timing = properties['transition'] ? {
          duration: afterStyle['transition-duration'] || '0s',
          easing: afterStyle['transition-timing-function'] || 'ease',
          delay: afterStyle['transition-delay'] || '0s',
        } : undefined;

        changes.push({
          trigger: {
            event: trace.event.kind,
            selector: trace.event.selector,
          },
          effect: {
            type: effectType,
            target: trace.event.selector,
            properties,
            timing,
          },
        });
      }
    }

    return changes;
  }

  /**
   * Generate summary
   */
  generateSummary(): string {
    const interactions = this.session.traces.filter(t => t.type === 'interaction');
    const mutations = this.session.traces.filter(t => t.type === 'mutation');
    const profiles = this.session.profiles;

    const duration = this.session.endTime 
      ? (this.session.endTime - this.session.startTime) / 1000 
      : 0;

    let summary = `# Animation Capture Session\n\n`;
    summary += `**URL**: ${this.session.url}\n`;
    summary += `**Duration**: ${duration.toFixed(1)}s\n`;
    summary += `**Session ID**: ${this.session.id}\n\n`;
    
    summary += `## Statistics\n\n`;
    summary += `- Total traces: ${this.session.traces.length}\n`;
    summary += `- Interactions captured: ${interactions.length}\n`;
    summary += `- DOM mutations: ${mutations.length}\n`;
    summary += `- Animation profiles extracted: ${profiles.length}\n\n`;

    if (profiles.length > 0) {
      summary += `## Animation Profiles\n\n`;
      
      for (const profile of profiles) {
        summary += `### ${profile.name}\n\n`;
        summary += `**Trigger**: ${profile.trigger.event} on \`${profile.trigger.selector}\`\n\n`;
        summary += `**Effect**: ${profile.effect.type}\n\n`;
        summary += `**Properties Changed**:\n`;
        
        for (const [prop, change] of Object.entries(profile.effect.properties)) {
          summary += `- \`${prop}\`: ${change.from} → ${change.to}\n`;
        }
        
        if (profile.effect.timing) {
          summary += `\n**Timing**:\n`;
          summary += `- Duration: ${profile.effect.timing.duration}\n`;
          if (profile.effect.timing.easing) {
            summary += `- Easing: ${profile.effect.timing.easing}\n`;
          }
          if (profile.effect.timing.delay) {
            summary += `- Delay: ${profile.effect.timing.delay}\n`;
          }
        }
        
        summary += `\n---\n\n`;
      }
    }

    return summary;
  }

  /**
   * Save session and generate outputs
   */
  async finalize(): Promise<void> {
    try {
      this.session.endTime = Date.now();

      // Extract profiles
      this.extractProfiles();

      // Generate summary
      const summary = this.generateSummary();

      // Write all files in parallel using async operations
      await Promise.all([
        fs.promises.writeFile(
          this.sessionFile,
          JSON.stringify(this.session, null, 2),
          'utf-8'
        ),
        fs.promises.writeFile(
          path.join(this.sessionDir, 'README.md'),
          summary,
          'utf-8'
        ),
        this.generateAIOutput()
      ]);

      // Verify all required files were created
      const requiredFiles = ['session.json', 'README.md', 'ai-output.json'];
      for (const file of requiredFiles) {
        const filePath = path.join(this.sessionDir, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Failed to create ${file} in ${this.sessionDir}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error during finalization:', error.message);
      throw error;
    }
  }

  /**
   * Generate AI-ready structured output
   */
  private async generateAIOutput(): Promise<void> {
    const aiOutput = {
      session: {
        url: this.session.url,
        duration: this.session.endTime! - this.session.startTime,
      },
      animationProfiles: this.session.profiles,
      interactionTraces: this.session.traces
        .filter(t => t.type === 'interaction')
        .map(t => ({
          timestamp: t.ts,
          event: t.event,
          before: t.before,
          after: t.after,
        })),
      metadata: {
        totalInteractions: this.session.traces.filter(t => t.type === 'interaction').length,
        totalMutations: this.session.traces.filter(t => t.type === 'mutation').length,
        capturedAt: new Date(this.session.startTime).toISOString(),
      },
    };

    await fs.promises.writeFile(
      path.join(this.sessionDir, 'ai-output.json'),
      JSON.stringify(aiOutput, null, 2),
      'utf-8'
    );
  }

  /**
   * Get output directory
   */
  getOutputDir(): string {
    return this.sessionDir;
  }
}
