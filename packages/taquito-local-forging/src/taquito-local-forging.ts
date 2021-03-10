/**
 * @packageDocumentation
 * @module @taquito/local-forging
 */

import { ForgeParams, Forger } from '@taquito/taquito';
import { CODEC } from './constants';
import { decoders } from './decoder';
import { encoders } from './encoder';
import { Uint8ArrayConsumer } from './uint8array-consumer';
import { latestProtocol } from '@taquito/taquito';

export { CODEC } from './constants';
export * from './decoder';
export * from './encoder';
export * from './uint8array-consumer';

export function getCodec(codec: CODEC) {
  return {
    encoder: encoders[codec],
    decoder: (hex: string) => {
      const consumer = Uint8ArrayConsumer.fromHexString(hex);
      return decoders[codec](consumer) as any;
    },
  };
}

export class LocalForger implements Forger {
  private protocol: string;
  private codec = getCodec(CODEC.MANAGER);

  constructor(private currentProtocol: string = latestProtocol) {
    this.protocol = currentProtocol;
  }

  forge(params: ForgeParams): Promise<string> {
    //console.log("From main: ");
    //console.log(this.protocol);
    return Promise.resolve(this.codec.encoder(params, this.protocol));
  }

  parse(hex: string): Promise<ForgeParams> {
    return Promise.resolve(this.codec.decoder(hex) as ForgeParams);
  }
}

export const localForger = new LocalForger();
