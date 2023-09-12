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
} from '@snickerdoodlelabs/objects';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SnickerdoodleCore } from '@snickerdoodlelabs/core';
import CenteredModal from './CenteredModal';

export interface ILayoutCtx {
  isModalVisible: boolean;
  handleVisible: (value: boolean) => void;
  handleCore: (value: SnickerdoodleCore) => void;
  setMeta: (value: any) => void;
  metaData: any;
  invitationParams: any;
  setInvitation: (value: any) => void;
  mobileCore: SnickerdoodleCore | null;
}

export const LayoutContext = React.createContext<ILayoutCtx>({} as ILayoutCtx);

const LayoutContextProvider = ({ children }: any) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [mobileCore, setMobileCore] = useState<SnickerdoodleCore | null>(null);
  const [invitationParams, setInvitationParams] = useState(null);
  const [metaData, setMetaData] = useState(null);

  const handleVisible = (value: boolean) => {
    setModalVisible(value);
  };
  const handleCore = (value: SnickerdoodleCore) => {
    setMobileCore(value);
  };
  const setMeta = (value: any) => {
    setMetaData(value);
  };
  const setInvitation = (value: any) => {
    setInvitationParams(value);
  };

  const InvitationPopUp = useMemo(() => {
    return (
      isModalVisible && (
        <CenteredModal
          isVisible={isModalVisible}
          toggleModal={function (): void {
            setModalVisible(!isModalVisible);
          }}
        />
      )
    );
  }, [isModalVisible, invitationParams, mobileCore]);

  return (
    <LayoutContext.Provider
      value={{
        isModalVisible,
        handleVisible,
        handleCore,
        setMeta,
        metaData,
        invitationParams,
        setInvitation,
        mobileCore,
      }}
    >
      {InvitationPopUp}
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContextProvider;

export const useLayoutContext = () => React.useContext(LayoutContext);
