import { Storable } from '../typings';
import { generateMnemonic } from '@boxyhq/error-code-mnemonic';
import { IndexNames } from '../controller/utils';
import { keyFromParts } from '../db/utils';
import type { SAMLTrace, Trace } from './types';

const INTERVAL_1_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const INTERVAL_1_DAY_MS = 24 * 60 * 60 * 1000;

class SAMLTracer {
  tracerStore: Storable;

  constructor({ db }) {
    this.tracerStore = db.store('saml:tracer');
    // Clean up stale traces at the start
    this.cleanUpStaleTraces();
    // Set timer to run every day
    setInterval(async () => {
      this.cleanUpStaleTraces();
    }, INTERVAL_1_DAY_MS);
  }

  public async saveTrace(payload: SAMLTrace) {
    const { context } = payload;
    // Friendly trace id
    const traceId: string = await generateMnemonic();
    // If timestamp present in payload use that value, else generate the current timestamp
    const timestamp = typeof payload.timestamp === 'number' ? payload.timestamp : Date.now();
    const traceValue: Trace = { ...payload, traceId, timestamp };
    await this.tracerStore.put(
      traceId,
      traceValue,
      {
        name: IndexNames.TenantProduct,
        value: keyFromParts(context.tenant, context.product),
      },
      { name: IndexNames.SSOClientID, value: context.clientID }
    );
    return traceId;
  }

  public async getByTraceId(traceId: string) {
    return (await this.tracerStore.get(traceId)) as Trace;
  }

  public async getAllTraces(pageOffset?: number, pageLimit?: number): Promise<Trace[]> {
    return (await this.tracerStore.getAll(pageOffset, pageLimit)) as Trace[];
  }

  /** Cleans up stale traces older than 1 week */
  public async cleanUpStaleTraces() {
    let staleTraces: Trace[] = [];
    for (let pageOffset = 0; ; pageOffset++) {
      const page = await this.getAllTraces(pageOffset, 50);
      if (page.length === 0) {
        break;
      }
      staleTraces = staleTraces.concat(
        page.filter(({ timestamp }) => Date.now() - timestamp > INTERVAL_1_WEEK_MS)
      );
    }

    for (let i = 0; i < staleTraces.length; i++) {
      await this.tracerStore.delete(staleTraces[i].traceId);
    }
  }
}

export default SAMLTracer;