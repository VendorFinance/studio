import { Inject } from '@nestjs/common';
import 'moment-duration-format';

import { APP_TOOLKIT, IAppToolkit } from '~app-toolkit/app-toolkit.interface';
import { Erc20 } from '~contract/contracts';
import { AppTokenTemplatePositionFetcher } from '~position/template/app-token.template.position-fetcher';
import {
  DefaultAppTokenDataProps,
  GetAddressesParams,
  GetPricePerShareParams,
  GetUnderlyingTokensParams,
} from '~position/template/app-token.template.types';

import { IdleContractFactory } from '../contracts';

import { IdleTranchesDefinitionsResolver } from './idle.tranche.token-definitions-resolver';

export type IdleAppTokenDefinition = {
  address: string;
  cdoAddress: string;
  underlyingTokenAddress: string;
};

export abstract class EthereumIdleTranchesPoolTokenFetcher extends AppTokenTemplatePositionFetcher<
  Erc20,
  DefaultAppTokenDataProps,
  IdleAppTokenDefinition
> {
  constructor(
    @Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit,
    @Inject(IdleContractFactory) protected readonly contractFactory: IdleContractFactory,
    @Inject(IdleTranchesDefinitionsResolver)
    protected readonly trancheDefinitionResolver: IdleTranchesDefinitionsResolver,
  ) {
    super(appToolkit);
  }

  getContract(address: string): Erc20 {
    return this.contractFactory.erc20({ network: this.network, address });
  }

  async getAddresses({ definitions }: GetAddressesParams<IdleAppTokenDefinition>): Promise<string[]> {
    return definitions.map(x => x.address);
  }

  async getUnderlyingTokenDefinitions({ definition }: GetUnderlyingTokensParams<Erc20, IdleAppTokenDefinition>) {
    return [{ address: definition.underlyingTokenAddress, network: this.network }];
  }

  async getPricePerShare({
    appToken,
    definition,
    multicall,
  }: GetPricePerShareParams<Erc20, DefaultAppTokenDataProps, IdleAppTokenDefinition>) {
    const perpYieldTrancheContract = this.contractFactory.idlePerpYieldTranches({
      address: definition.cdoAddress,
      network: this.network,
    });
    const pricePerShareRaw = await multicall.wrap(perpYieldTrancheContract).tranchePrice(appToken.address);
    const decimals = appToken.tokens[0].decimals;

    return [Number(pricePerShareRaw) / 10 ** decimals];
  }
}
