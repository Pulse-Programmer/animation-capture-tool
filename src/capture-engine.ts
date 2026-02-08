/**
 * Capture Engine
 *
 * Main orchestrator for browser instrumentation and trace capture
 */

import { chromium, Browser, Page, BrowserContext } from "playwright";
import { TraceRecord } from "./types";
import { TraceWriter } from "./trace-writer";
import { getInstrumentationScript } from "./instrumentation";

export interface CaptureOptions {
  url: string;
  outputDir?: string;
  headless?: boolean;
  timeout?: number;
  waitForIdle?: boolean;
}

export class CaptureEngine {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private writer: TraceWriter | null = null;
  private sessionId: string;
  private isRecording: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Start capture session
   */
  async start(options: CaptureOptions): Promise<void> {
    console.log(`🚀 Starting capture session: ${this.sessionId}`);
    console.log(`📍 Target URL: ${options.url}`);

    // Initialize trace writer
    const outputDir = options.outputDir || "./captures";
    this.writer = new TraceWriter(outputDir, this.sessionId, options.url);

    // Launch browser
    this.browser = await chromium.launch({
      headless: options.headless ?? false,
      args: ["--disable-blink-features=AutomationControlled"],
    });

    // Create context
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    // Create page
    this.page = await this.context.newPage();

    // Setup trace callback
    await this.page.exposeFunction("__captureCallback", (trace: any) => {
      this.handleTrace(trace);
    });

    // Inject instrumentation
    await this.page.addInitScript(getInstrumentationScript());

    // Setup network monitoring
    this.setupNetworkMonitoring();

    // Navigate to URL
    console.log("🌐 Loading page...");
    console.log("   (This may take up to 60 seconds for complex sites)");

    try {
      await this.page.goto(options.url, {
        waitUntil: options.waitForIdle ? "networkidle" : "domcontentloaded",
        timeout: options.timeout || 60000,
      });
    } catch (error: any) {
      if (error.message.includes("Timeout")) {
        console.log(
          "\n⚠️  Page load timeout reached, but continuing anyway...",
        );
        console.log("   The page may still be usable for capturing.");
      } else {
        throw error;
      }
    }

    // Verify instrumentation is working
    await this.page.waitForTimeout(1000); // Give page time to initialize

    const isInstrumented = await this.page.evaluate(() => {
      return typeof window.__captureCallback === "function";
    });

    if (!isInstrumented) {
      console.log("⚠️  Warning: Instrumentation may not be working properly");
      console.log("   Trying to reinject...");
      await this.page.evaluate(getInstrumentationScript());
    }

    this.isRecording = true;
    console.log("✅ Page loaded. Recording interactions...");
    console.log("💡 Interact with the page. Press Ctrl+C to stop.");
    console.log("   Watch for indicators: 👆 (click) 👉 (hover) ⌨️ (input)");
  }

  /**
   * Setup network request monitoring
   */
  private setupNetworkMonitoring(): void {
    if (!this.page) return;

    const pendingRequests = new Map<string, number>();

    this.page.on("request", (request: any) => {
      const url = request.url();
      // Only track XHR and Fetch
      if (
        request.resourceType() === "xhr" ||
        request.resourceType() === "fetch"
      ) {
        pendingRequests.set(url, Date.now());
      }
    });

    this.page.on("response", (response: any) => {
      const url = response.url();
      const startTime = pendingRequests.get(url);

      if (startTime) {
        const timing = Date.now() - startTime;
        pendingRequests.delete(url);

        // Only track API calls (not static assets)
        if (
          url.includes("/api/") ||
          url.includes("/graphql") ||
          response.request().resourceType() === "xhr" ||
          response.request().resourceType() === "fetch"
        ) {
          this.handleTrace({
            ts: Date.now(),
            type: "network",
            network: [
              {
                url,
                method: response.request().method(),
                status: response.status(),
                timing,
              },
            ],
          });
        }
      }
    });
  }

  /**
   * Handle incoming trace
   */
  private handleTrace(trace: any): void {
    if (!this.isRecording || !this.writer) return;

    // Log test traces to verify communication
    if (trace.type === "test") {
      console.log("✓ Instrumentation verified:", trace.message);
      return;
    }

    // Enrich trace with session info
    const enrichedTrace: TraceRecord = {
      ...trace,
      sessionId: this.sessionId,
      url: this.page?.url() || "",
      viewport: {
        width: 1920,
        height: 1080,
      },
    };

    // Write to file
    this.writer.appendTrace(enrichedTrace);

    // Log to console (condensed)
    this.logTrace(enrichedTrace);
  }

  /**
   * Log trace to console
   */
  private logTrace(trace: TraceRecord): void {
    const time = new Date(trace.ts).toLocaleTimeString();

    if (trace.type === "interaction" && trace.event) {
      const emoji = this.getEventEmoji(trace.event.kind);
      console.log(
        `${emoji} [${time}] ${trace.event.kind} on ${trace.event.selector}`,
      );

      // Log style changes if significant
      if (trace.before && trace.after) {
        const changes = Object.keys(trace.after.style.computed).filter(
          (prop) =>
            trace.before!.style.computed[prop] !==
            trace.after!.style.computed[prop],
        );

        if (changes.length > 0) {
          console.log(`   └─ Styles changed: ${changes.join(", ")}`);
        }
      }
    } else if (trace.type === "mutation" && trace.mutation) {
      console.log(
        `🔄 [${time}] ${trace.mutation.intent} (${trace.mutation.affectedElements} elements)`,
      );
    } else if (trace.type === "network" && trace.network) {
      for (const req of trace.network) {
        const status = req.status >= 200 && req.status < 300 ? "✓" : "✗";
        console.log(
          `🌐 [${time}] ${status} ${req.method} ${req.url} (${req.timing}ms)`,
        );
      }
    }
  }

  /**
   * Get emoji for event type
   */
  private getEventEmoji(kind: string): string {
    const emojis: Record<string, string> = {
      click: "👆",
      hover: "👉",
      input: "⌨️",
      submit: "📤",
      focus: "🎯",
      blur: "💨",
      scroll: "📜",
      keypress: "🔤",
    };
    return emojis[kind] || "🔘";
  }

  /**
   * Wait for user interactions
   */
  async waitForInteractions(duration?: number): Promise<void> {
    if (duration) {
      await new Promise((resolve) => setTimeout(resolve, duration));
    } else {
      // Wait indefinitely until stop() is called
      await new Promise(() => {});
    }
  }

  /**
   * Stop capture session
   */
  async stop(): Promise<string> {
    console.log("\n🛑 Stopping capture session...");
    console.log("   Please wait while we finalize the traces...");
    this.isRecording = false;

    // Stop capture in page
    if (this.page) {
      try {
        await this.page.evaluate(() => {
          if (window.__stopCapture) {
            window.__stopCapture();
          }
        });
      } catch (error) {
        // Page might be closed
      }
    }

    // Finalize traces
    console.log("   📝 Processing captured interactions...");
    if (this.writer) {
      await this.writer.finalize();
      console.log("   ✅ Traces saved and processed");

      // Small delay to ensure all file writes complete
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Close browser
    console.log("   🔒 Closing browser...");
    if (this.browser) {
      await this.browser.close();
    }

    const outputDir = this.writer?.getOutputDir() || "";
    console.log(`\n✅ Session complete!`);
    console.log(`📁 Output: ${outputDir}`);
    console.log("");
    console.log("Next steps:");
    console.log(`  1. View:   npm start view ${outputDir}`);
    console.log(`  2. Export: npm start export ${outputDir} -f prompt`);

    return outputDir;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __captureCallback: (trace: any) => void;
    __stopCapture: () => void;
    __mutationObserver: MutationObserver;
  }
}
