import { TransportationType } from '../types';

export const getTransportationLabel = (transportation: TransportationType) => {
  switch (transportation) {
    case TransportationType.Seaplane:
      return '수상 비행기';
    case TransportationType.Domestic:
      return '국내선 비행기';
    default:
      return transportation;
  }
};
