#!/usr/bin/env node

/**
 * Recovery Script for Incomplete Sessions
 *
 * This script processes incomplete capture sessions that have traces.jsonl
 * but are missing session.json, ai-output.json, and README.md
 */

const fs = require('fs');
const path = require('path');

const capturesDir = path.join(__dirname, 'captures');

// Read all session directories
const sessions = fs.readdirSync(capturesDir).filter(name => name.startsWith('session_'));

console.log(`🔍 Found ${sessions.length} session(s) in ${capturesDir}\n`);

let recovered = 0;
let skipped = 0;
let failed = 0;

for (const sessionName of sessions) {
  const sessionDir = path.join(capturesDir, sessionName);
  const tracesFile = path.join(sessionDir, 'traces.jsonl');
  const sessionFile = path.join(sessionDir, 'session.json');
  const aiOutputFile = path.join(sessionDir, 'ai-output.json');
  const readmeFile = path.join(sessionDir, 'README.md');

  // Check if session needs recovery
  const hasTraces = fs.existsSync(tracesFile);
  const hasSession = fs.existsSync(sessionFile);
  const hasAIOutput = fs.existsSync(aiOutputFile);
  const hasReadme = fs.existsSync(readmeFile);

  if (!hasTraces) {
    console.log(`⚠️  ${sessionName}: No traces.jsonl found, skipping`);
    skipped++;
    continue;
  }

  if (hasSession && hasAIOutput && hasReadme) {
    console.log(`✅ ${sessionName}: Already complete, skipping`);
    skipped++;
    continue;
  }

  console.log(`🔧 ${sessionName}: Recovering...`);

  try {
    // Read all traces
    const tracesContent = fs.readFileSync(tracesFile, 'utf-8');
    const traces = tracesContent.trim().split('\n').map(line => JSON.parse(line));

    if (traces.length === 0) {
      console.log(`   ⚠️  No traces found in file, skipping`);
      skipped++;
      continue;
    }

    // Extract session info from traces
    const firstTrace = traces[0];
    const lastTrace = traces[traces.length - 1];
    const sessionId = firstTrace.sessionId || sessionName;
    const url = firstTrace.url || 'unknown';
    const startTime = traces[0].ts;
    const endTime = traces[traces.length - 1].ts;

    // Extract animation profiles
    const profiles = extractProfiles(traces);

    // Create session object
    const session = {
      id: sessionId,
      url: url,
      startTime: startTime,
      endTime: endTime,
      traces: traces,
      profiles: profiles
    };

    // Write session.json
    if (!hasSession) {
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2), 'utf-8');
      console.log(`   ✅ Created session.json`);
    }

    // Create ai-output.json
    if (!hasAIOutput) {
      const aiOutput = {
        session: {
          url: session.url,
          duration: session.endTime - session.startTime
        },
        animationProfiles: session.profiles,
        interactionTraces: session.traces
          .filter(t => t.type === 'interaction')
          .map(t => ({
            timestamp: t.ts,
            event: t.event,
            before: t.before,
            after: t.after
          })),
        metadata: {
          totalInteractions: session.traces.filter(t => t.type === 'interaction').length,
          totalMutations: session.traces.filter(t => t.type === 'mutation').length,
          capturedAt: new Date(session.startTime).toISOString(),
          recoveredAt: new Date().toISOString()
        }
      };

      fs.writeFileSync(aiOutputFile, JSON.stringify(aiOutput, null, 2), 'utf-8');
      console.log(`   ✅ Created ai-output.json`);
    }

    // Create README.md
    if (!hasReadme) {
      const summary = generateSummary(session);
      fs.writeFileSync(readmeFile, summary, 'utf-8');
      console.log(`   ✅ Created README.md`);
    }

    console.log(`   🎉 Recovery complete!`);
    console.log(`   📊 ${traces.length} traces, ${profiles.length} animation profiles\n`);
    recovered++;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    failed++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Recovered: ${recovered}`);
console.log(`   ⚠️  Skipped: ${skipped}`);
console.log(`   ❌ Failed: ${failed}`);

if (recovered > 0) {
  console.log(`\n💡 You can now view recovered sessions with:`);
  console.log(`   npm start list`);
  console.log(`   npm start view <session-path>`);
}

// Helper functions

function extractProfiles(traces) {
  const profiles = [];
  const bySelector = new Map();

  // Group interaction traces by selector
  for (const trace of traces) {
    if (trace.type === 'interaction' && trace.event) {
      const selector = trace.event.selector;
      if (!bySelector.has(selector)) {
        bySelector.set(selector, []);
      }
      bySelector.get(selector).push(trace);
    }
  }

  // Analyze each group for patterns
  for (const [selector, selectorTraces] of bySelector) {
    const styleChanges = findConsistentStyleChanges(selectorTraces);

    for (const change of styleChanges) {
      profiles.push({
        name: `${change.trigger.event}-on-${selector.split(' ').pop() || 'element'}`,
        trigger: change.trigger,
        effect: change.effect
      });
    }
  }

  return profiles;
}

function findConsistentStyleChanges(traces) {
  const changes = [];

  for (const trace of traces) {
    if (!trace.event || !trace.before || !trace.after) continue;

    const beforeStyle = trace.before.style?.computed || {};
    const afterStyle = trace.after.style?.computed || {};

    // Find what changed
    const properties = {};

    for (const prop in afterStyle) {
      if (beforeStyle[prop] !== afterStyle[prop]) {
        properties[prop] = {
          from: beforeStyle[prop] || '',
          to: afterStyle[prop] || ''
        };
      }
    }

    if (Object.keys(properties).length > 0) {
      // Determine effect type
      let effectType = 'transition';

      if (trace.after.dom?.classes?.length !== trace.before.dom?.classes?.length) {
        effectType = 'class-toggle';
      } else if (properties['animation-name']) {
        effectType = 'animation';
      }

      // Extract timing if transition exists
      const timing = properties['transition'] ? {
        duration: afterStyle['transition-duration'] || '0s',
        easing: afterStyle['transition-timing-function'] || 'ease',
        delay: afterStyle['transition-delay'] || '0s'
      } : undefined;

      changes.push({
        trigger: {
          event: trace.event.kind,
          selector: trace.event.selector
        },
        effect: {
          type: effectType,
          target: trace.event.selector,
          properties,
          timing
        }
      });
    }
  }

  return changes;
}

function generateSummary(session) {
  const interactions = session.traces.filter(t => t.type === 'interaction');
  const mutations = session.traces.filter(t => t.type === 'mutation');
  const profiles = session.profiles;

  const duration = (session.endTime - session.startTime) / 1000;

  let summary = `# Animation Capture Session (Recovered)\n\n`;
  summary += `**URL**: ${session.url}\n`;
  summary += `**Duration**: ${duration.toFixed(1)}s\n`;
  summary += `**Session ID**: ${session.id}\n`;
  summary += `**Recovered**: ${new Date().toLocaleString()}\n\n`;

  summary += `## Statistics\n\n`;
  summary += `- Total traces: ${session.traces.length}\n`;
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

  summary += `## Note\n\n`;
  summary += `This session was recovered from incomplete data. The original capture was interrupted before finalization completed.\n`;

  return summary;
}
