import { captureException } from '@sentry/react-native';
import { OPENSEA_API_KEY, OPENSEA_RINKEBY_API_KEY } from 'react-native-dotenv';
import { rainbowFetch } from '../rainbow-fetch';
import NetworkTypes from '@rainbow-me/networkTypes';
import { parseAccountUniqueTokens } from '@rainbow-me/parsers';
import { handleSignificantDecimals } from '@rainbow-me/utilities';
import logger from 'logger';


export const UNIQUE_TOKENS_LIMIT_PER_PAGE = 50;
export const UNIQUE_TOKENS_LIMIT_TOTAL = 2000;

export const apiGetAccountUniqueTokens = async (network, address, page) => {
  try {
    const API_KEY =
      network === NetworkTypes.rinkeby
        ? OPENSEA_RINKEBY_API_KEY
        : OPENSEA_API_KEY;
    const networkPrefix = network === NetworkTypes.mainnet ? '' : `${network}-`;
    const offset = page * UNIQUE_TOKENS_LIMIT_PER_PAGE;
    const url = `https://${networkPrefix}api.opensea.io/api/v1/assets`;
    const data = await rainbowFetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': API_KEY,
      },
      method: 'get',
      params: {
        limit: UNIQUE_TOKENS_LIMIT_PER_PAGE,
        offset: offset,
        owner: address,
      },
      timeout: 20000, // 20 secs
    });
    return parseAccountUniqueTokens(data);
  } catch (error) {
    logger.sentry('Error getting unique tokens', error);
    captureException(new Error('Opensea: Error getting unique tokens'));
    throw error;
  }
};

export const apiGetUniqueTokenFloorPrice = async (
  network,
  urlSuffixForAsset
) => {
  try {
    const networkPrefix = network === NetworkTypes.mainnet ? '' : `${network}-`;
    const url = `https://${networkPrefix}api.opensea.io/api/v1/asset/${urlSuffixForAsset}`;
    const data = await rainbowFetch(url, {
      headers: {
        Accept: 'application/json',
        method: 'get',
        timeout: 5000, // 5 secs
      },
    });

    const slug = data?.data?.collection?.slug;

    const collectionURL = `https://${networkPrefix}api.opensea.io/api/v1/collection/${slug}`;
    const collectionData = await rainbowFetch(collectionURL, {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': OPENSEA_API_KEY,
      },
      method: 'get',
      timeout: 5000, // 5 secs
    });

    const tempPrice = collectionData?.data?.collection?.stats?.floor_price;

    if (parseFloat(tempPrice) === 0 || !tempPrice) {
      return 'None';
    }

    const tempFloorPrice = handleSignificantDecimals(tempPrice, 5);

    return parseFloat(tempFloorPrice) + ' ETH';
  } catch (error) {
    logger.sentry('Error getting NFT floor price', error);
    captureException(new Error('Opensea: Error getting NFT floor price'));
    throw error;
  }
};

export const apiGetNftSemiFungibility = async (
  networkPrefix,
  contractAddress,
  tokenID
) => {
  try {
    const checkFungibility = `https://${networkPrefix}api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&token_id=${tokenID}&only_opensea=false&offset=0&limit=1`;

    const fungibility = await rainbowFetch(checkFungibility, {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': OPENSEA_API_KEY,
      },
      method: 'get',
      timeout: 10000, // 10 secs
    });

    const semiFungible =
      fungibility?.data?.asset_events[0]?.asset?.asset_contract
        ?.asset_contract_type === 'semi-fungible';
    return semiFungible;
  } catch (error) {
    logger.sentry('Error getting NFT fungibility', error);
    captureException(new Error('Opensea: Error getting NFT fungibility'));
    throw error;
  }
};

export const apiGetNftTransactionHistoryForEventType = async (
  networkPrefix,
  semiFungible,
  accountAddress,
  contractAddress,
  tokenID,
  eventType
) => {
  try {
    let offset = 0;
    let array = [];
    let nextPage = true;
    while (nextPage) {
      const requestUrl = semiFungible
        ? `https://${networkPrefix}api.opensea.io/api/v1/events?account_address=${accountAddress}&asset_contract_address=${contractAddress}&token_id=${tokenID}&event_type=${eventType}&only_opensea=false&offset=${offset}&limit=300`
        : `https://${networkPrefix}api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&token_id=${tokenID}&event_type=${eventType}&only_opensea=false&offset=${offset}&limit=300`;

      let currentPage = await rainbowFetch(requestUrl, {
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': OPENSEA_API_KEY,
        },
        method: 'get',
        timeout: 10000, // 10 secs
      });
      array = array.concat(currentPage?.data?.asset_events || []);
      offset = array.length + 1;
      nextPage = currentPage?.data?.asset_events?.length === 300;
    }
    return array
  } catch (error) {
    logger.sentry('Error getting NFT transaction history', error);
    captureException(new Error('Opensea: Error getting NFT transaction history'));
    throw error;
  }
};
