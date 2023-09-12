import {
  DataWalletAddress,
  ESolidityAbiParameterType,
  IDynamicRewardParameter,
  ISnickerdoodleCoreEvents,
  LinkedAccount,
  SDQLQueryRequest,
  SDQLString,
  Invitation,
  DomainName,
  EInvitationStatus,
  BigNumberString,
  EVMContractAddress,
  TokenId,
  DataPermissions,
  CountryCode,
  Gender,
} from '@snickerdoodlelabs/objects';

import React, { useContext, useEffect, useState } from 'react';
import { SnickerdoodleCore } from '@snickerdoodlelabs/core';
import { MobileStorageUtils } from '@/MobileStorageUtils';
import { coreConfig } from '@/core';
import * as ethUtil from 'ethereumjs-util';
import {
  AccountAddress,
  EChain,
  EVMAccountAddress,
  LanguageCode,
  Signature,
} from '@snickerdoodlelabs/objects';
import { Wallet, utils } from 'ethers';
import { useLayoutContext } from './LayaoutContext';
import { te } from 'date-fns/locale';
import { fromSafePromise, okAsync } from 'neverthrow';

export interface IEventCtx {}

export const EventCtx = React.createContext<IEventCtx>({} as IEventCtx);

const mobileCore = new SnickerdoodleCore(
  coreConfig, // Config file for SnickerdoodleCore
  new MobileStorageUtils(),
  undefined
);

const EventContextProvider = ({ children }: any) => {
  const {
    setMeta,
    setInvitation,
    handleVisible,
    handleCore,
  } = useLayoutContext();
  const test2 = async () => {
    try {
    } catch (e) {
      console.log('error', e);
    }
    const unlockMessage = mobileCore.account
      .getUnlockMessage('en' as LanguageCode)
      .andThen(unlockMessage => {
        const privateKey =
          'b235b07b6e4a6eaacad41a647bf0d41ce2fc4f3f80cf2e1e0597bed59d2a6847';
        const wallet = new Wallet(privateKey);
        return fromSafePromise(wallet.signMessage(unlockMessage)).map(
          signature => {
            return signature;
          }
        );
      })
      .map(signature => {
        console.log(
          '----------------------------------------------------------Signature3:',
          signature
        );
        mobileCore.account.unlock(
          '0x38a56d73164ff760ddcace3519cad0c6de2cbe3c' as EVMAccountAddress,
          signature as Signature,
          'en' as LanguageCode,
          EChain.EthereumMainnet
        );
        mobileCore
          .getConsentContractCID(
            '0x4aA425a01DC984829A0EaAE399399a7EA472F52e' as EVMContractAddress
          )
          .map(cid => {
            mobileCore.invitation
              .getInvitationMetadataByCID(cid)
              .map(metaData => {
                console.log('metaData', metaData);
                setMeta(metaData);
              });
          });
        const _invitation = new Invitation(
          '' as DomainName,
          '0x4aA425a01DC984829A0EaAE399399a7EA472F52e' as EVMContractAddress,
          TokenId(BigInt(652952061)),
          Signature(
            '0x8e6a823d756cf548dab4efcced4df8294358bc2d58d2eff87ec8ad8f6ce84680119fddd41d5e55960e9443cc5a991eae4ff8aadeeacbe9e0b5495c55270d256d1b'
          )
        );
        setInvitation(_invitation);
        handleVisible(true);
        handleCore(mobileCore);
        mobileCore.setLocation('TR' as CountryCode);
        mobileCore.setGender('male' as Gender);
      })
      .mapErr(e => {
        console.log('------------------------------------------ERROR2', e);
      });
  };

  useEffect(() => {
    test2();
    mobileCore.getEvents().map((events: ISnickerdoodleCoreEvents) => {
      events.onInitialized.subscribe(onInitialized);
      events.onAccountAdded.subscribe(onAccountAdded);
      events.onQueryPosted.subscribe(onQueryPosted);
      events.onCohortJoined.subscribe(onCohortJoined);
    });
  }, []);

  const onInitialized = (address: DataWalletAddress) => {
    console.log(
      '----------------------------------------------------------INITIALIZED',
      address
    );
    /*   setUnlockState(true);
    updateLinkedAccounts();
    cancelLoading(); */
  };
  const onCohortJoined = () => {
    console.log(
      '----------------------------------------------------------onCohortJoined'
    );
  };
  const onAccountAdded = (account: LinkedAccount) => {
    console.log(
      '----------------------------------------------------------ACCOUNT ADDED',
      account
    );

    /*     updateLinkedAccounts();
    cancelLoading(); */
  };

  const onQueryPosted = (request: SDQLQueryRequest) => {
    console.log(
      `----------------------------------------------------------Extension: query posted with contract address: ${request.consentContractAddress} and CID: ${request.query.cid}`
    );
    console.log(
      '----------------------------------------------------------REQUEST',
      request.query.query
    );

    // @TODO - remove once ipfs issue is resolved
    const getStringQuery = () => {
      const queryObjOrStr = request.query.query;
      let queryString: SDQLString;
      if (typeof queryObjOrStr === 'object') {
        queryString = JSON.stringify(queryObjOrStr) as SDQLString;
      } else {
        queryString = queryObjOrStr;
      }
      return queryString;
    };

    // DynamicRewardParameters added to be returned
    const parameters: IDynamicRewardParameter[] = [];
    // request.accounts.filter((acc.sourceAccountAddress == request.dataWalletAddress) ==> (acc))

    mobileCore
      .getReceivingAddress(request.consentContractAddress)
      .map(accountAddress => {
        request.rewardsPreview.forEach(eligibleReward => {
          if (request.dataWalletAddress !== null) {
            parameters.push({
              recipientAddress: {
                type: ESolidityAbiParameterType.address,
                value: accountAddress,
              },
              compensationKey: {
                type: ESolidityAbiParameterType.string,
                value: eligibleReward.compensationKey,
              },
            } as IDynamicRewardParameter);
          }
        });

        mobileCore
          .approveQuery(
            request.consentContractAddress,
            {
              cid: request.query.cid,
              query: getStringQuery(),
            },
            parameters
          )
          .map(() => {
            console.log(
              `----------------------------------------------------------Processing Query! Contract Address: ${request.consentContractAddress}, CID: ${request.query.cid}`
            );
          })
          .mapErr(e => {
            console.log(
              `----------------------------------------------------------Error while processing query! Contract Address: ${request.consentContractAddress}, CID: ${request.query.cid}`
            );
            console.log(
              '----------------------------------------------------------EE',
              e
            );
          });
      });
  };
  const onCloudStorageActivated = () => {};
  const onCloudStorageDeactivated = () => {};

  return <EventCtx.Provider value={{}}>{children}</EventCtx.Provider>;
};

export default EventContextProvider;

export const useEventContext = () => useContext(EventCtx);
