#!/usr/bin/env node

/**
 * CLI Interface for Animation Capture Tool
 */

import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import { CaptureEngine } from "./capture-engine";

const program = new Command();

program
  .name("capture-anim")
  .description(
    "Capture web interactions and animations for AI-powered reconstruction",
  )
  .version("1.0.0");

program
  .command("record")
  .description("Start recording interactions on a website")
  .argument("<url>", "URL of the website to capture")
  .option("-o, --output <dir>", "Output directory for captures", "./captures")
  .option("-t, --timeout <ms>", "Page load timeout in milliseconds", "60000")
  .option(
    "-d, --duration <seconds>",
    "Recording duration (0 for manual stop)",
    "0",
  )
  .option("--headless", "Run browser in headless mode", false)
  .option("--wait-idle", "Wait for network idle before starting", false)
  .action(async (url: string, options: any) => {
    try {
      // Validate URL
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        console.error("❌ Error: URL must start with http:// or https://");
        process.exit(1);
      }

      const engine = new CaptureEngine();

      // Track if we're stopping
      let isStopping = false;
      let cleanupPromise: Promise<void> | null = null;

      // Setup graceful shutdown
      const cleanup = async () => {
        if (isStopping) {
          console.log("\n⚠️  Already stopping, please be patient...");
          return;
        }

        isStopping = true;

        try {
          await engine.stop();
          console.log("✅ Cleanup completed successfully");
        } catch (error: any) {
          console.error("❌ Error during cleanup:", error.message);
          if (error.stack) {
            console.error("   Stack trace:", error.stack);
          }
        } finally {
          process.exit(0);
        }
      };

      // Handle Ctrl+C - prevent immediate exit
      process.on("SIGINT", () => {
        if (!cleanupPromise) {
          // Prevent default exit behavior
          process.stdin.resume();
          cleanupPromise = cleanup();
        } else {
          console.log("\n⚠️  Already stopping, please wait...");
        }
      });

      process.on("SIGTERM", () => {
        if (!cleanupPromise) {
          process.stdin.resume();
          cleanupPromise = cleanup();
        }
      });

      // Start capture
      await engine.start({
        url,
        outputDir: options.output,
        headless: options.headless,
        timeout: parseInt(options.timeout),
        waitForIdle: options.waitIdle,
      });

      // Wait for specified duration or until interrupted
      const duration = parseInt(options.duration);
      if (duration > 0) {
        console.log(`⏱️  Recording for ${duration} seconds...`);
        await engine.waitForInteractions(duration * 1000);
        await engine.stop();
      } else {
        // Wait indefinitely
        await engine.waitForInteractions();
      }
    } catch (error: any) {
      console.error("❌ Error:", error.message);

      // Provide helpful tips based on error
      if (error.message.includes("Timeout")) {
        console.error("");
        console.error("💡 Tips:");
        console.error("  - Try increasing timeout: --timeout 90000");
        console.error("  - Wait for network: --wait-idle");
        console.error("  - Try a simpler site first");
        console.error("  - Check your internet connection");
      }

      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all captured sessions")
  .option("-d, --directory <dir>", "Captures directory", "./captures")
  .action((options: any) => {
    try {
      const capturesDir = options.directory;

      if (!fs.existsSync(capturesDir)) {
        console.log("📁 No captures directory found");
        console.log(`   Expected: ${capturesDir}`);
        console.log("");
        console.log("💡 Run a capture first:");
        console.log("   npm start record https://example.com");
        return;
      }

      const sessions = fs
        .readdirSync(capturesDir)
        .filter((name) => name.startsWith("session_"))
        .map((name) => {
          const sessionPath = path.join(capturesDir, name);
          const stats = fs.statSync(sessionPath);
          const aiOutputPath = path.join(sessionPath, "ai-output.json");
          const hasOutput = fs.existsSync(aiOutputPath);

          let info = { url: "unknown", profiles: 0, traces: 0 };
          if (hasOutput) {
            try {
              const data = JSON.parse(fs.readFileSync(aiOutputPath, "utf-8"));
              info = {
                url: data.session.url,
                profiles: data.animationProfiles.length,
                traces: data.interactionTraces.length,
              };
            } catch {}
          }

          return {
            name,
            path: sessionPath,
            date: stats.mtime,
            complete: hasOutput,
            ...info,
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      if (sessions.length === 0) {
        console.log("📁 No sessions found in", capturesDir);
        console.log("");
        console.log("💡 Run a capture first:");
        console.log("   npm start record https://example.com");
        return;
      }

      console.log(`📊 Found ${sessions.length} capture session(s):\n`);

      sessions.forEach((session, i) => {
        const status = session.complete ? "✅" : "⚠️";
        const date = session.date.toLocaleString();

        console.log(`${i + 1}. ${status} ${session.name}`);
        console.log(`   Date: ${date}`);
        console.log(`   URL: ${session.url}`);
        console.log(
          `   Profiles: ${session.profiles} | Traces: ${session.traces}`,
        );
        console.log(`   Path: ${session.path}`);
        console.log("");
      });

      console.log("Commands:");
      console.log("  View:   npm start view <path>");
      console.log("  Export: npm start export <path> -f prompt");
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("view")
  .description("View captured session")
  .argument("<session-dir>", "Session directory to view")
  .action((sessionDir: string) => {
    try {
      const summaryPath = path.join(sessionDir, "README.md");
      const aiOutputPath = path.join(sessionDir, "ai-output.json");

      if (!fs.existsSync(sessionDir)) {
        console.error("❌ Error: Session directory not found");
        process.exit(1);
      }

      // Display summary
      if (fs.existsSync(summaryPath)) {
        const summary = fs.readFileSync(summaryPath, "utf-8");
        console.log(summary);
      }

      // Display AI output info
      if (fs.existsSync(aiOutputPath)) {
        const aiOutput = JSON.parse(fs.readFileSync(aiOutputPath, "utf-8"));
        console.log("\n📊 AI-Ready Output Available");
        console.log(
          `   Animation Profiles: ${aiOutput.animationProfiles.length}`,
        );
        console.log(
          `   Interaction Traces: ${aiOutput.interactionTraces.length}`,
        );
        console.log(`   File: ${aiOutputPath}\n`);
      }
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

program
  .command("export")
  .description("Export session data in different formats")
  .argument("<session-dir>", "Session directory to export")
  .option("-f, --format <format>", "Export format (json, md, prompt)", "json")
  .option("-o, --output <file>", "Output file")
  .action((sessionDir: string, options: any) => {
    try {
      // Check if session directory exists
      if (!fs.existsSync(sessionDir)) {
        console.error("❌ Error: Session directory not found");
        console.error(`   Looking for: ${sessionDir}`);
        console.error("");
        console.error("💡 Tip: List available sessions with:");
        console.error("   ls -la ./captures/");
        process.exit(1);
      }

      const aiOutputPath = path.join(sessionDir, "ai-output.json");

      if (!fs.existsSync(aiOutputPath)) {
        console.error("❌ Error: Session data not found");
        console.error(`   Looking for: ${aiOutputPath}`);
        console.error("");
        console.error("This usually means:");
        console.error(
          "  1. The capture session was interrupted (didn't press Ctrl+C cleanly)",
        );
        console.error("  2. The session is still recording");
        console.error("  3. No interactions were captured");
        console.error("");
        console.error("Files in session directory:");
        try {
          const files = fs.readdirSync(sessionDir);
          files.forEach((f) => console.error(`  - ${f}`));
        } catch {
          console.error("  (unable to read directory)");
        }
        process.exit(1);
      }

      const data = JSON.parse(fs.readFileSync(aiOutputPath, "utf-8"));

      let output: string = "";
      let defaultFilename: string = "";

      switch (options.format) {
        case "json":
          output = JSON.stringify(data, null, 2);
          defaultFilename = "export.json";
          break;

        case "md":
          output = generateMarkdownExport(data);
          defaultFilename = "export.md";
          break;

        case "prompt":
          output = generateAIPrompt(data);
          defaultFilename = "ai-prompt.txt";
          break;

        default:
          console.error("❌ Error: Invalid format. Use json, md, or prompt");
          process.exit(1);
      }

      const outputFile =
        options.output || path.join(sessionDir, defaultFilename);
      fs.writeFileSync(outputFile, output, "utf-8");
      console.log(`✅ Exported to: ${outputFile}`);
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

/**
 * Generate markdown export
 */
function generateMarkdownExport(data: any): string {
  let md = `# Animation Capture Export\n\n`;
  md += `**Source**: ${data.session.url}\n`;
  md += `**Duration**: ${(data.session.duration / 1000).toFixed(1)}s\n\n`;

  md += `## Animation Profiles (${data.animationProfiles.length})\n\n`;

  for (const profile of data.animationProfiles) {
    md += `### ${profile.name}\n\n`;
    md += `**Trigger**: \`${profile.trigger.event}\` on \`${profile.trigger.selector}\`\n\n`;
    md += `**Effect Type**: ${profile.effect.type}\n\n`;
    md += `**Properties**:\n`;

    for (const [prop, change] of Object.entries(profile.effect.properties)) {
      md += `- \`${prop}\`: \`${(change as any).from}\` → \`${(change as any).to}\`\n`;
    }

    if (profile.effect.timing) {
      md += `\n**Timing**:\n`;
      md += `- Duration: ${profile.effect.timing.duration}\n`;
      md += `- Easing: ${profile.effect.timing.easing || "ease"}\n`;
    }

    md += `\n---\n\n`;
  }

  return md;
}

/**
 * Generate AI prompt
 */
function generateAIPrompt(data: any): string {
  let prompt = `You are a frontend engineer.

Given the following interaction traces from ${data.session.url}, generate minimal JavaScript that recreates the observed animations and behaviors.

Do not invent features. Prefer event listeners and class toggles. Use vanilla JS unless stated otherwise.

## Animation Profiles

`;

  for (const profile of data.animationProfiles) {
    prompt += `### ${profile.name}\n\n`;
    prompt += `Trigger: ${profile.trigger.event} on selector "${profile.trigger.selector}"\n`;
    prompt += `Effect: ${profile.effect.type}\n`;
    prompt += `Target: ${profile.effect.target}\n\n`;
    prompt += `Properties to animate:\n`;

    for (const [prop, change] of Object.entries(profile.effect.properties)) {
      prompt += `- ${prop}: ${(change as any).from} → ${(change as any).to}\n`;
    }

    if (profile.effect.timing) {
      prompt += `\nTiming:\n`;
      prompt += `- Duration: ${profile.effect.timing.duration}\n`;
      prompt += `- Easing: ${profile.effect.timing.easing || "ease"}\n`;
      if (profile.effect.timing.delay) {
        prompt += `- Delay: ${profile.effect.timing.delay}\n`;
      }
    }

    prompt += `\n`;
  }

  prompt += `\n## Task

Generate:
1. HTML structure (if needed)
2. CSS classes/animations
3. JavaScript event handlers
4. Ensure the animation is smooth and matches the timing

Provide complete, working code that can be directly used in a project.\n`;

  return prompt;
}

// Parse arguments and execute
program.parse();
