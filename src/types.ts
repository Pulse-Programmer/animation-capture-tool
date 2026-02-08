/**
 * Type definitions for interaction traces
 */

export interface InteractionEvent {
  kind: 'click' | 'hover' | 'input' | 'submit' | 'focus' | 'blur' | 'scroll' | 'keypress';
  selector: string;
  x?: number;
  y?: number;
  value?: string;
  key?: string;
}

export interface DOMSnapshot {
  selector: string;
  html: string;
  attributes: Record<string, string>;
  classes: string[];
  text?: string;
}

export interface StyleSnapshot {
  selector: string;
  computed: Record<string, string>;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  timing: number;
}

export interface TraceRecord {
  ts: number;
  type: 'interaction' | 'mutation' | 'style' | 'network';
  sessionId: string;
  url: string;
  viewport: { width: number; height: number };
  
  // For interaction events
  event?: InteractionEvent;
  before?: {
    dom: DOMSnapshot;
    style: StyleSnapshot;
  };
  after?: {
    dom: DOMSnapshot;
    style: StyleSnapshot;
  };
  
  // For mutations
  mutation?: {
    intent: string;
    summary: string;
    affectedElements: number;
    changes: Array<{
      selector: string;
      type: 'add' | 'remove' | 'modify';
      details: any;
    }>;
  };
  
  // For network
  network?: NetworkRequest[];
  
  // Optional user annotation
  annotation?: string;
}

export interface AnimationProfile {
  name: string;
  trigger: {
    event: string;
    selector: string;
  };
  effect: {
    type: 'transition' | 'animation' | 'class-toggle' | 'dom-manipulation';
    target: string;
    properties: Record<string, { from: string; to: string }>;
    timing?: {
      duration: string;
      easing?: string;
      delay?: string;
    };
  };
  dependencies?: string[];
}

export interface CaptureSession {
  id: string;
  url: string;
  startTime: number;
  endTime?: number;
  traces: TraceRecord[];
  profiles: AnimationProfile[];
}
