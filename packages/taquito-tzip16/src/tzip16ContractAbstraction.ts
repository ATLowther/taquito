import { BigMapAbstraction, Context, ContractAbstraction, ContractProvider, Wallet } from '@taquito/taquito';
import { bytes2Char } from './tzip16-utils';
import { MetadataProviderInterface } from './interfaceMetadataProvider';
import { MetadataNotFound, UriNotFound } from './tzip16Errors';
import BigNumber from 'bignumber.js';
import { Schema } from '@taquito/michelson-encoder';

export type MetadataContext = Context & {
    metadataProvider: MetadataProviderInterface;
};

type BigMapId = { int: string } ;

const metadataBigMapType = {
    prim: 'big_map',
    args: [{ prim: 'string' }, { prim: 'bytes' }],
    annots: ['%metadata']
};
export class Tzip16ContractAbstraction {
    private _fetcher: MetadataProviderInterface;

    constructor(
        private constractAbstraction: ContractAbstraction<ContractProvider | Wallet>,
        private context: MetadataContext
    ) {
        this._fetcher = context.metadataProvider;
    }

    private findMetadataBigMap(): BigMapAbstraction {
            const metadataBigMapId = this.constractAbstraction.schema.FindFirstInTopLevelPair<BigMapId>(
                this.constractAbstraction.script.storage,
                metadataBigMapType
            );

            if(!metadataBigMapId) {
                throw new MetadataNotFound();
            }

            return new BigMapAbstraction(
                new BigNumber(metadataBigMapId['int']),
                new Schema(metadataBigMapType),
                this.context.contract
            );
    }

    private async getUriOrFail() {
        const metadataBigMap = this.findMetadataBigMap();
        const uri = await metadataBigMap.get<string>('');
        if(!uri) {
            throw new UriNotFound();
        }
        return uri;
    }

    /**
     * @description Return an object containing the metadata, the uri, an optional integrity check result and an optional sha256 hash
     */
    async getMetadata() {
        const uri = await this.getUriOrFail();
        return this._fetcher.provideMetadata(this.constractAbstraction, bytes2Char(uri), this.context);
    }
}
