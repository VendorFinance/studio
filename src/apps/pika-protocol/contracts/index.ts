import { Injectable, Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { ContractFactory } from '~contract/contracts';
import { Network } from '~types/network.interface';

import { PikaProtocolVault__factory } from './ethers';
import { PikaProtocolVaultReward__factory } from './ethers';

// eslint-disable-next-line
type ContractOpts = { address: string; network: Network };

@Injectable()
export class PikaProtocolContractFactory extends ContractFactory {
  constructor(@Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit) {
    super((network: Network) => appToolkit.getNetworkProvider(network));
  }

  pikaProtocolVault({ address, network }: ContractOpts) {
    return PikaProtocolVault__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
  pikaProtocolVaultReward({ address, network }: ContractOpts) {
    return PikaProtocolVaultReward__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
}

export type { PikaProtocolVault } from './ethers';
export type { PikaProtocolVaultReward } from './ethers';
